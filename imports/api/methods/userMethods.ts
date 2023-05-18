import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";

Meteor.methods({
  'user.addUser': ({ username, email, password }) => {
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
  'user.findUser': (email) => {
    check(email, String);
    const user = Meteor.users.findOne({ 'emails.address': email });
    if (!user) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }
    return user;
  },
});
