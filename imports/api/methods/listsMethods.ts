import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { ListsCollection } from "../collections/ListsCollection";
import { INewList } from "/imports/ui/NewList";

Meteor.methods({
  'lists.insert'(newList: INewList) {
    const {listName, editors, editorsCanInvite } = newList
    check(listName, String);
    check(editors, [String]);
    check(editorsCanInvite, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    const listId = ListsCollection.insert({
      listName,
      editors: [...editors],
      editorsCanInvite,
      createdAt: new Date,
      ownerId: this.userId,
      bannedEditors: []
    })

    return listId;
  },
});