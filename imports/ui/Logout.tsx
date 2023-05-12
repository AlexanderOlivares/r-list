import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useUserContext } from "../../context/UserContext"
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const userContext = useUserContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    Meteor.logout((error) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('You have successfully logged out.');
        userContext.dispatch({
          type: "logout",
          payload: null
        })
        navigate(`/`)
      }
    });
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default Logout;