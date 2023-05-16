import React from 'react'
import { useNavigate } from 'react-router-dom';
import Logout from './Logout';
import { useUserContext } from '/context/UserContext';

export default function Nav() {
  const navigate = useNavigate();
  const userContext = useUserContext();
  const { _id: userId, username } = userContext.state ?? {};

  const navigateTo = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const buttonText = e.currentTarget.textContent;
    if (!userId || buttonText === "Login") navigate('/');
    navigate(`/profile/${username}`)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "20px" }}>
      {userId ? (
        <>
          <button onClick={navigateTo}>Profile</button>
          <Logout />
        </>
      ) : (
        <button onClick={navigateTo}>Login</button>
      )}
    </div>
  )
}
