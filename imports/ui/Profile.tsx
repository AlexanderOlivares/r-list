import React from "react";
import Logout from "./Logout"
import { useUserContext } from "../../context/UserContext"
import { useNavigate } from 'react-router-dom';


function Profile() {
  const userContext = useUserContext();
  const navigate = useNavigate();
  const { username } = userContext.state ?? {};
  const listId = 1;

  const makeNewList = () => {
    navigate(`/lists/${listId}`)
  }

  console.log(username)

  return (
    <>
      <div>
        <Logout />
        <h1> Profile </h1>
        <h3>{username}</h3>
      </div>
      <div>
        <button onClick={makeNewList}>New List</button>
      </div>
      <div>
        <h3>My Lists</h3>
      </div>
    </>
  );
}

export default Profile;