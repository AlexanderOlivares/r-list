import { Meteor } from "meteor/meteor";
import { TasksCollection } from "./collections/TasksCollection";
import { ListsCollection } from "./collections/ListsCollection";

Meteor.publish("tasks", function publishTasks() {
  return TasksCollection.find();
});

Meteor.publish("lists", function publishLists() {
  return ListsCollection.find({});
});

Meteor.publish("users", function publishUsers() {
  return Meteor.users.find({});
});
