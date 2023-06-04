import { Meteor } from "meteor/meteor";
import { ListsCollection } from "./collections/ListsCollection";

export function userIsListOwner(listId: string, attemptedAction: string) {
  const userId = Meteor.userId();
  const dbList = ListsCollection.findOne({ _id: listId }, { fields: { ownerId: 1 } });

  if (!userId) {
    throw new Meteor.Error("Error finding current user");
  }

  if (!dbList) {
    throw new Meteor.Error("Error finding current list");
  }

  if (userId !== dbList.ownerId) {
    throw new Meteor.Error(`User unauthorized to ${attemptedAction} `);
  }

  return true;
}
