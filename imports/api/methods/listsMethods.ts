import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { ListsCollection } from "../collections/ListsCollection";
import { IEditor, INewList } from "/imports/ui/components/NewList";
import { userIsListOwner } from "../utils";
import { Email } from "meteor/email";

Meteor.methods({
  async "lists.insert"(newList: INewList) {
    const { listName, editors, editorsCanInvite } = newList;
    check(listName, String);
    check(editors, [
      {
        email: Match.Optional(String),
        editorId: Match.Optional(String),
        editorUsername: Match.Optional(String),
      },
    ]);
    check(editorsCanInvite, Boolean);

    const listOwner = Meteor.user();

    if (!listOwner || !listOwner.username) {
      throw new Meteor.Error("Not authorized.");
    }

    const listId = ListsCollection.insert({
      listName,
      editors: [...editors],
      editorsCanInvite,
      createdAt: new Date(),
      ownerId: listOwner._id,
      ownerUsername: listOwner.username,
      bannedEditors: [],
    });

    (async () => {
      await Promise.all(
        editors.map(async (editor) => {
          let email = editor.email;

          if (!editor.email) {
            const user = Meteor.users.findOne({
              $or: [{ _id: editor.editorId }, { username: editor.editorUsername }],
            });

            if (user?.emails?.[0]?.address) {
              email = user?.emails?.[0]?.address;
            }
          }

          if (!email) return;

          const url = Meteor.absoluteUrl();
          const subject = `${listOwner.username} invited you to a shared list`;
          const html = `Signup or login at <a href="${url}">${url}</a> to collaborate with ${listOwner.username}`;

          Email.send({ to: email, from: "noreply@rlist.lol", subject, html });
        })
      );
    })();

    return listId;
  },
  "lists.banEditors"({ listId, usersToBan }) {
    check(usersToBan, [String]);
    check(listId, String);
    userIsListOwner(listId, "ban users");

    const usersBanned = ListsCollection.update(
      { _id: listId },
      {
        $pull: {
          editors: {
            $or: [{ email: { $in: usersToBan } }, { editorUsername: { $in: usersToBan } }],
          } as IEditor,
        },
        $addToSet: {
          bannedEditors: {
            $each: usersToBan,
          },
        },
      }
    );

    if (!usersBanned) {
      throw new Meteor.Error("Error banning user(s). Please try again later");
    }

    return usersToBan.length;
  },
  "lists.addEditors"({
    listId,
    formattedEditors,
  }: {
    listId: string | undefined;
    formattedEditors: IEditor[];
  }) {
    check(listId, String);
    check(formattedEditors, Array);
    check(formattedEditors, [
      {
        email: Match.Optional(String),
        editorId: Match.Optional(String),
        editorUsername: Match.Optional(String),
      },
    ]);

    const editorsAdded = ListsCollection.update(
      { _id: listId },
      {
        $addToSet: {
          editors: {
            $each: formattedEditors,
          },
        },
      }
    );

    if (!editorsAdded) {
      throw new Meteor.Error("Error adding editors. Please try again later");
    }

    return formattedEditors.length;
  },
  "lists.delete"(listId: string) {
    check(listId, String);
    userIsListOwner(listId, "delete list");

    const wasDeleted = ListsCollection.remove({
      _id: listId,
    });

    if (!wasDeleted) {
      throw new Meteor.Error("Error deleting list. Please try again later");
    }

    return "List deleted";
  },
  "lists.rename"(list) {
    check(list._id, String);
    check(list.newName, String);
    userIsListOwner(list._id, "rename list");

    const listRenamed = ListsCollection.update(
      {
        _id: list._id,
      },
      {
        $set: {
          listName: list.newName,
        },
      }
    );

    if (!listRenamed) {
      throw new Meteor.Error("Error renaming list. Please try again later");
    }

    return "List renamed";
  },
  sendEmail(to, from, subject, text) {
    // Make sure that all arguments are strings.
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();

    Email.send({ to, from, subject, text });
  },
});
