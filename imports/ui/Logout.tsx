import React from 'react';
import { Meteor } from 'meteor/meteor';

const Logout: React.FC = () => {

  const handleLogout = () => {
    Meteor.logout((error) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('You have successfully logged out.');
      }
    });
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default Logout;