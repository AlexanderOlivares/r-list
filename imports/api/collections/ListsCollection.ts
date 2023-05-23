import { Mongo } from "meteor/mongo";

export interface IList {
  _id: string;
  listName: string;
  ownerId: string;
  bannedEditors: string[];
  createdAt: Date;
  editors: string[];
  editorsCanInvite: boolean;
}

export const ListsCollection = new Mongo.Collection<IList>("lists");
