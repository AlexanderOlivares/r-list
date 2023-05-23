import React from "react";
import { useUserContext } from "../../../context/UserContext";
import NewList from "../components/NewList";
import { Typography } from "antd";
import ListPreview from "../components/ListPreview";
const { Title } = Typography;

function Profile() {
  const userContext = useUserContext();
  const { username } = userContext.state ?? {};

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Title level={1}>{username}</Title>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Title level={4}>New List</Title>
        </div>
        <div>
          <NewList />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Title level={3}>Lists I Made</Title>
      </div>
      <div>
        <ListPreview userOwnsList={true} />
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Title level={3}>Lists I Can Edit</Title>
      </div>
      <div>
        <ListPreview userOwnsList={false} />
      </div>
    </>
  );
}

export default Profile;
