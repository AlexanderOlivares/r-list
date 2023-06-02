import { Mongo } from "meteor/mongo";
export interface ITask {
  _id: string;
  text: string;
  listId: string;
  lastEditedBy: string;
  createdAt: Date;
  lastEditedAt: Date;
  userId: string;
}

export const TasksCollection = new Mongo.Collection<ITask>("tasks");
