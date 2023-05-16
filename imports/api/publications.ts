import { Meteor } from "meteor/meteor";
import { TasksCollection } from "./collections/TasksCollection";
import { ListsCollection } from "./collections/ListsCollection";

Meteor.publish("tasks", function publishTasks() {
  return TasksCollection.find({ userId: this.userId });
});

Meteor.publish("lists", function publishLists() {
  // add if editors includes this.userId and if not banned 
  return ListsCollection.find({ ownerId: this.userId });
});
