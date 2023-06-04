import { Mongo } from "meteor/mongo";
import { IEditor } from "/imports/ui/components/NewList";

export interface IList {
  _id: string;
  listName: string;
  ownerId: string;
  ownerUsername: string;
  bannedEditors: string[];
  createdAt: Date;
  editors: IEditor[];
  editorsCanInvite: boolean;
}

export const ListsCollection = new Mongo.Collection<IList>("lists");
