import { Meteor } from "meteor/meteor";
import "../imports/api/methods/userMethods";
import "../imports/api/methods/tasksMethods";
import "../imports/api/methods/listsMethods";
import "../imports/api/publications";

Meteor.startup(async () => {
  console.log("Server startup");
});
