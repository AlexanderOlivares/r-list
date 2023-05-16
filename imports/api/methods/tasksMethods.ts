import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { TasksCollection } from "../collections/TasksCollection";

Meteor.methods({
  'tasks.insert'(task) {
    const { text, listId, userId, lastEditedAt, lastEditedBy} = task;
    check(text, String);
    check(listId, String);
    check(userId, String);
    check(lastEditedAt, Date);
    check(lastEditedBy, String);

    if (!this.userId || userId !== userId) {
      throw new Meteor.Error('Not authorized.');
    }

    const taskId = TasksCollection.insert({
      text,
      listId,
      lastEditedBy, 
      lastEditedAt,
      createdAt: new Date,
      userId: this.userId,
    })

    return taskId;
  },
});