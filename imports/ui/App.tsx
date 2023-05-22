import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import TaskForm from "./pages/TaskForm";
import NotFound from "./components/NotFound";
import Nav from "./components/Nav";
import Login from "./pages/Login";
import { useUserContext } from "../../context/UserContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import Spin from "./components/Spin";
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
