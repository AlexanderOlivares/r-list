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
    const ERROR_MESSAGE = "Error banning user(s). Please try again later";

    const users = Meteor.users
      .find({
        $or: [{ "emails.address": { $in: usersToBan } }, { username: { $in: usersToBan } }],
      })
      .fetch();

    if (!users.length || users.length !== usersToBan.length) {
      throw new Meteor.Error(ERROR_MESSAGE);
    }

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
      throw new Meteor.Error(ERROR_MESSAGE);
    }

    return users.length;
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
