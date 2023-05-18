import React from "react";
import { useUserContext } from "../../context/UserContext"
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import NewList from "./NewList";
import { useTracker } from "meteor/react-meteor-data";
import { ListsCollection } from "../api/collections/ListsCollection";


function Profile() {
  const userContext = useUserContext();
  const navigate = useNavigate();
  const { username, _id: userId } = userContext.state ?? {};


  const { lists, loading } = useTracker(() => {

    const noDataAvailable = { lists: [], loading: false };

    const user = Meteor.user();

    if (!user) {
      return noDataAvailable;
    }

    const userEmail = user?.emails ? user.emails[0].address : undefined;

    const handler = Meteor.subscribe('lists');

    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    const foundLists = ListsCollection.find(
      {
        $or: [
          { ownerId: userId },
          { editors: { $elemMatch: { email: userEmail } } },
        ]
      },
      {
        sort: { createdAt: -1 },
      }
    ).fetch();

    return { loading: false, lists: foundLists };
  });

  const goToList = (listId: string) => {
    navigate(`/lists/${listId}`);
  }

  return (
    <>
      <div>
        <h1> Profile </h1>
        <h3>{username}</h3>
        <NewList />
      </div>

      <div>
        <h3>Lists I Made</h3>
      </div>
      {loading ? (
        <h1>loading lists...</h1>
      ) : (
        lists.filter(list => list.ownerId === userId)
          .map(list => {
            return (
              <div key={list._id}>
                <p>{list.listName}</p>
                <button onClick={() => goToList(list._id)}>Go to list</button>
              </div>
            )
          })
      )}
      <div>
        <h3>Lists I Can Edit</h3>
      </div>
      {loading ? (
        <h1>loading lists...</h1>
      ) : (
        lists.filter(list => list.ownerId !== userId)
          .map(list => {
            return (
              <div key={list._id}>
                <p>{list.listName}</p>
                <button onClick={() => goToList(list._id)}>Go to list</button>
              </div>
            )
          })
      )}
    </>
  );
}

export default Profile;