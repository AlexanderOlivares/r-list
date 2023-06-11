import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { ListsCollection } from "../collections/ListsCollection";
import { IEditor, INewList } from "/imports/ui/components/NewList";
import { userIsListOwner } from "../utils";

Meteor.methods({
  "lists.insert"(newList: INewList) {
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

    const user = Meteor.user();

    if (!user || !user.username) {
      throw new Meteor.Error("Not authorized.");
    }

    const listId = ListsCollection.insert({
      listName,
      editors: [...editors],
      editorsCanInvite,
      createdAt: new Date(),
      ownerId: user._id,
      ownerUsername: user.username,
      bannedEditors: [],
    });

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
});
