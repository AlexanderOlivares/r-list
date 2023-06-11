import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";

Accounts.emailTemplates.siteName = "rlist";
Accounts.emailTemplates.from = "noreply@rlist.lol";

Accounts.urls.resetPassword = function (token) {
  return Meteor.absoluteUrl(`/?passwordReset=true&token=${token}`);
};
