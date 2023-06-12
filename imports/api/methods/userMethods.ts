import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";

Meteor.methods({
  "user.addUser": function ({ username, email, password }) {
    check(email, String);
    check(password, String);
    check(username, String);

    const userId = Accounts.createUser({
      username,
      email,
      password,
    });

    if (!userId) {
      throw new Meteor.Error("create-user-error", "Error reating user");
    }

    this.setUserId(userId);
    const user = Meteor.user();

    return user;
  },
  "user.findUser": (usernameOrEmail) => {
    check(usernameOrEmail, String);

    const user = Meteor.users.findOne({
      $or: [{ "emails.0.address": usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    return user;
  },
  "user.getUsers": () => {
    const users = Meteor.users
      .find(
        {},
        {
          limit: 10,
          fields: { username: 1 },
        }
      )
      .fetch();

    if (!users) {
      throw new Meteor.Error("get-users-error", "Error fetching users list");
    }

    return users;
  },
  "user.requestPasswordReset": (email) => {
    check(email, String);

    const user = Meteor.users.findOne({ "emails.0.address": email });

    if (!user) {
      throw new Meteor.Error("Password-reset", "No user account with that email");
    }

    Accounts.sendResetPasswordEmail(user._id, email);

    return `Password reset sent to ${email}`;
  },
});
