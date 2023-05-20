import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";
import TaskForm from "./TaskForm";
import NotFound from "./NotFound";
import Nav from "./Nav";
import { useUserContext } from "../../context/UserContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import Spin from "./Spin";
const { Content } = Layout;
import "antd/dist/antd.css";

export const App = () => {
  const userContext = useUserContext();
  const isAuth = userContext.state;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedLoginToken = localStorage.getItem("Meteor.loginToken");
    if (!storedLoginToken) {
      setLoading(false);
      return;
    }
    Meteor.loginWithToken(storedLoginToken, error => {
      if (error) {
        console.log("no login token found");
      } else {
        const user = Meteor.user();
        if (user) {
          userContext.dispatch({
            type: "login",
            payload: user,
          });
        }
      }
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Layout className="layout">
        <Content>
          {loading ? (
            <Spin />
          ) : (
            <Router>
              <Nav />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="lists/:listId" element={isAuth ? <TaskForm /> : <Login />} />
                <Route
                  path="profile/:userId"
                  element={isAuth ? <Profile /> : <Navigate replace to={"/"} />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          )}
        </Content>
      </Layout>
    </>
  );
};
