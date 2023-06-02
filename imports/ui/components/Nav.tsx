import React from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "/context/UserContext";
import type { MenuProps } from "antd";
import { Menu } from "antd";

export default function Nav() {
  const navigate = useNavigate();
  const userContext = useUserContext();
  const { _id: userId, username } = userContext.state ?? {};

  const navItems: MenuProps["items"] = ["login", "signup", "profile", "logout"]
    .filter((_, i) => (userId ? i > 1 : i < 2)) // only show profile/logout while logged in
    .map(page => ({
      key: page,
      label: `${page}`,
    }));

  const navigateTo: MenuProps["onClick"] = e => {
    const { key: page } = e;
    switch (page) {
      case "logout":
        handleLogout();
        break;
      case "profile":
        if (!userId) return navigate("/");
        navigate(`/profile/${username}`);
        break;
      case "signup":
        navigate("signup");
        break;
      default:
        navigate("/");
    }
  };

  const handleLogout = () => {
    Meteor.logout(error => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("You have successfully logged out.");
        userContext.dispatch({
          type: "logout",
          payload: null,
        });
        navigate("/");
      }
    });
  };

  return (
    <Menu
      mode="horizontal"
      theme={"light"}
      items={navItems}
      onClick={navigateTo}
      selectedKeys={[""]}
    />
  );
}
