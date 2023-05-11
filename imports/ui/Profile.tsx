import React from "react";
import Logout from "./Logout"

function User() {
  // use tracker to get this stuff?

  return (
    <div>
      <Logout />
      <h1> Profile </h1>
      {/* <h1>Username: {username}</h1>
      <p>Login Time: {timestamp}</p> */}
    </div>
  );
}

export default User;