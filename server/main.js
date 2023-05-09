import { Meteor } from "meteor/meteor";
import { LinksCollection } from "../imports/api/links";
import { TasksCollection } from "../imports/api/TasksCollection";
import { Accounts } from "meteor/accounts-base";

const insertTask = (taskText, user) =>
  TasksCollection.insert({ text: taskText, userId: user._id, createdAt: new Date() });

const SEED_USERNAME = "meteorite";
const SEED_PASSWORD = "password";

Meteor.startup(async () => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }

  const user = Accounts.findUserByUsername(SEED_USERNAME);

  if (TasksCollection.find().count() === 0) {
    [
      "First Task",
      "Second Task",
      "Third Task",
      "Fourth Task",
      "Fifth Task",
      "Sixth Task",
      "Seventh Task",
    ].forEach(taskText => insertTask(taskText, user));
  }
  // We publish the entire Links collection to all clients.
  // In order to be fetched in real-time to the clients
  Meteor.publish("links", function () {
    return LinksCollection.find();
  });
});
