import React, { useState } from 'react';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = {
      username,
      email,
      password
    }

    Meteor.call('addUser', user, (error, result) => {
      if (error) {
        console.log(error.reason);
      } else {
        console.log(`User added with ID ${result}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div>
        <label htmlFor="email">Email</label>

        <input
          type="email"
          placeholder="Email"
          name="email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="username">Username</label>

        <input
          type="text"
          placeholder="Username"
          name="username"
          required
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>

        <input
          type="password"
          placeholder="Password"
          name="password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <button type="submit">Log In</button>
      </div>
    </form>
  );
};

export default LoginForm;
