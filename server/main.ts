import { Meteor } from "meteor/meteor";
import "../imports/api/methods/userMethods";
import "../imports/api/methods/tasksMethods";
import "../imports/api/methods/listsMethods";
import "../imports/api/publications";
import "./emailTemplates";
import { Accounts } from "meteor/accounts-base";

Meteor.startup(async () => {
  console.log("Server startup");

  const { host, username, password, port } = Meteor.settings.private.smtp;
  process.env.MAIL_URL = `smtp://${username}:${password}@${host}:${port}`;
  Accounts.config({
    loginExpirationInDays: 30,
  });
});
