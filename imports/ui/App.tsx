import React from 'react';
import Signup from "./Signup"
import Login from "./Login"
import Profile from "./Profile"
import TaskForm from './TaskForm';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import {
  BrowserRouter as Router, Routes, Route, Navigate
} from "react-router-dom";


export const App = () => {
  const loggedInUser = useTracker(() => Meteor.user());
  console.log("loggedInUser ", loggedInUser)

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Login />}
          />
          <Route
            path="signup"
            element={<Signup />}
          />
          <Route
            path="lists/:listId"
            element={loggedInUser ? <TaskForm /> : <Navigate replace to={"/"} />}
          />
          <Route
            path="profile/:userId"
            element={loggedInUser ? <Profile /> : <Navigate replace to={"/"} />}
          />
        </Routes>
      </Router>
    </>
  )
};
