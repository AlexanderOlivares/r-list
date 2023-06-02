import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { ListsCollection } from "../collections/ListsCollection";
import { IEditor, INewList } from "/imports/ui/components/NewList";

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

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }

    const listId = ListsCollection.insert({
      listName,
      editors: [...editors],
      editorsCanInvite,
      createdAt: new Date(),
      ownerId: this.userId,
      bannedEditors: [],
    });

    return listId;
  },
  "lists.banEditor"({ listId, usernameOrEmail }) {
    check(usernameOrEmail, String);
    check(listId, String);

    const user = Meteor.users.findOne({
      $or: [{ "emails.address": usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      throw new Meteor.Error("Error banning user");
    }

    const banned = ListsCollection.update(
      { _id: listId },
      {
        $pull: {
          editors: {
            $or: [{ email: usernameOrEmail }, { editorUsername: usernameOrEmail }],
          } as IEditor,
        },
      }
    );

    return banned;
  },
});
