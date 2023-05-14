import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { TasksCollection } from "../collections/TasksCollection";

Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    const taskId = TasksCollection.insert({
      text,
      createdAt: new Date,
      userId: this.userId,
    })

    return taskId;
  },
});