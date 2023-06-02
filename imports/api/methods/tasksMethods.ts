import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { ITask, TasksCollection } from "../collections/TasksCollection";

Meteor.methods({
  "tasks.insert"(task: Partial<ITask>) {
    const { text, listId, userId, lastEditedAt, lastEditedBy, username } = task;
    check(text, String);
    check(listId, String);
    check(userId, String);
    check(lastEditedAt, Date);
    check(lastEditedBy, String);
    check(username, String);

    if (!this.userId || userId !== userId) {
      throw new Meteor.Error("Not authorized.");
    }

    const taskId = TasksCollection.insert({
      text,
      listId,
      lastEditedBy,
      lastEditedAt,
      createdAt: new Date(),
      userId: this.userId,
      username,
    });

    return taskId;
  },
});
