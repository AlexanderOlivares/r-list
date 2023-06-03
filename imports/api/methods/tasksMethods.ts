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
  "tasks.delete"(taskId: string) {
    check(taskId, String);

    const removed = TasksCollection.remove({
      _id: taskId,
    });

    if (!removed) {
      throw new Meteor.Error("Error deleting task");
    }

    return "Task deleted";
  },
  "tasks.edit"(task: ITask) {
    const { _id, text, listId, userId, lastEditedAt, createdAt, lastEditedBy, username } = task;
    check(_id, String);
    check(text, String);
    check(listId, String);
    check(userId, String);
    check(lastEditedAt, Date);
    check(createdAt, Date);
    check(lastEditedBy, String);
    check(username, String);

    const taskFound = TasksCollection.findOne({ _id });

    if (!taskFound) {
      throw new Meteor.Error("Error task not found");
    }

    const user = Meteor.user();

    if (!user) {
      throw new Meteor.Error("User not found");
    }

    const updatedTask = TasksCollection.update(
      {
        _id: taskFound._id,
      },
      {
        $set: {
          text,
          lastEditedBy: user.username,
          lastEditedAt: new Date(),
        },
      }
    );

    if (!updatedTask) {
      throw new Meteor.Error("Error updating task");
    }

    return "Task updated";
  },
});
