import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";

Meteor.methods({
  addUser: ({ username, email, password }) => {
    check(email, String);
    check(password, String);
    check(username, String);

    const userId = Accounts.createUser({
      username,
      email,
      password,
    });

    return userId;
  },
});
