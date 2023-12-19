import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { ITask, TasksCollection } from "../collections/TasksCollection";

Meteor.methods({
  "tasks.insert"(task: Partial<ITask>) {
    const { text, listId, creatorUserId, lastEditedAt, lastEditedBy, creatorUsername } = task;
    check(text, String);
    check(listId, String);
    check(creatorUserId, String);
    check(lastEditedAt, Date);
    check(lastEditedBy, String);
    check(creatorUsername, String);

    if (!this.userId || this.userId !== creatorUserId) {
      throw new Meteor.Error("Not authorized.");
    }

    const taskId = TasksCollection.insert({
      text,
      listId,
      lastEditedBy,
      lastEditedAt,
      createdAt: new Date(),
      creatorUserId: this.userId,
      creatorUsername,
    });

    return taskId;
  },
  "tasks.delete"(taskIds: string[]) {
    check(taskIds, [String]);

    const removed = TasksCollection.remove({
      _id: { $in: taskIds },
    });

    if (!removed) {
      throw new Meteor.Error("Error deleting tasks");
    }

    const tasks = taskIds.length === 1 ? "Task" : "Tasks";
    return `${tasks} deleted`;
  },
  "tasks.edit"(task: ITask) {
    const {
      _id,
      text,
      listId,
      creatorUserId,
      lastEditedAt,
      createdAt,
      lastEditedBy,
      creatorUsername,
    } = task;
    check(_id, String);
    check(text, String);
    check(listId, String);
    check(creatorUserId, String);
    check(lastEditedAt, Date);
    check(createdAt, Date);
    check(lastEditedBy, String);
    check(creatorUsername, String);

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
