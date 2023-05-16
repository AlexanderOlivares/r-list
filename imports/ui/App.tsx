import React from 'react';
import Signup from "./Signup"
import Login from "./Login"
import Profile from "./Profile"
import TaskForm from './TaskForm';
import { useUserContext } from "../../context/UserContext"

import {
  BrowserRouter as Router, Routes, Route, Navigate
} from "react-router-dom";
import Nav from './Nav';


export const App = () => {
  const userContext = useUserContext();
  const isAuth = userContext.state;
  console.log("isAuth ", userContext.state)

  return (
    <>
      <Router>
        <Nav />
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
            element={isAuth ? <TaskForm /> : <Login />}
          />
          <Route
            path="profile/:userId"
            element={isAuth ? <Profile /> : <Navigate replace to={"/"} />}
          />
        </Routes>
      </Router>
    </>
  )
};
