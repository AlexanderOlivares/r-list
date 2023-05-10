import { Meteor } from "meteor/meteor";
import { TasksCollection } from "../imports/api/TasksCollection";
import { Accounts } from "meteor/accounts-base";
import "/imports/api/methods";

const insertTask = (taskText, user) =>
  TasksCollection.insert({ text: taskText, userId: user._id, createdAt: new Date() });

Meteor.startup(async () => {
  Meteor.publish("addUser", function (user) {
    return Meteor.methods.addUser(user);
  });
});
