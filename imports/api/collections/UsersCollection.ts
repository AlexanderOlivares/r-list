import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const UsersCollection = new Mongo.Collection<Meteor.User>("users");
