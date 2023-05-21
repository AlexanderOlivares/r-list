import React from "react";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import NewList from "./NewList";
import { useTracker } from "meteor/react-meteor-data";
import { ListsCollection } from "../api/collections/ListsCollection";
import { Typography } from "antd";
const { Title } = Typography;

function Profile() {
  const userContext = useUserContext();
  const navigate = useNavigate();
  const { username, _id: userId, emails } = userContext.state ?? {};

  const { lists, loading } = useTracker(() => {
    const handler = Meteor.subscribe("lists");
    const noDataAvailable = { lists: [], loading: false };

    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    const userEmail = emails?.length && emails[0].address;

    const foundLists = ListsCollection.find(
      {
        $or: [
          { ownerId: userId },
          { "editors.email": userEmail },
          { "editors.editorUsername": username },
        ],
      },
      {
        sort: { createdAt: -1 },
      }
    ).fetch();

    return { loading: false, lists: foundLists };
  });

  const goToList = (listId: string) => {
    navigate(`/lists/${listId}`);
  };

  return (
    <>
      <div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Title level={1}>{username}</Title>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Title level={4}>New List</Title>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <NewList />
        </div>
      </div>

      <div>
        <h3>Lists I Made</h3>
      </div>
      {loading ? (
        <h1>loading lists...</h1>
      ) : (
        lists
          .filter(list => list.ownerId === userId)
          .map(list => {
            return (
              <div key={list._id}>
                <p>{list.listName}</p>
                <button onClick={() => goToList(list._id)}>Go to list</button>
              </div>
            );
          })
      )}
      <div>
        <h3>Lists I Can Edit</h3>
      </div>
      {loading ? (
        <h1>loading lists...</h1>
      ) : (
        lists
          .filter(list => list.ownerId !== userId)
          .map(list => {
            return (
              <div key={list._id}>
                <p>{list.listName}</p>
                <button onClick={() => goToList(list._id)}>Go to list</button>
              </div>
            );
          })
      )}
    </>
  );
}

export default Profile;
