import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from "../../context/UserContext"

const Login = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const goToSignup = () => navigate("/signup")

  const handleSubmit = (e) => {
    e.preventDefault();

    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log(`Login success`);
        const user = Meteor.user();
        userContext.dispatch({
          type: "login",
          payload: user
        })
        navigate(`/profile/${user.username}`)
      }
    });
  };


  return (
    <>
      <div>
        <h1>Welcome to R-List</h1>
        <h4>Share your lists with friends</h4>
        <button onClick={goToSignup}>Sign Up</button>
      </div>
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
    </>
  );
};

export default Login;
