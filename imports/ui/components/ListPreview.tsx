import { List, Skeleton } from "antd";
import React from "react";
import { useUserContext } from "../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { IList, ListsCollection } from "../../api/collections/ListsCollection";
import Title from "antd/lib/typography/Title";

interface IListPreviewProps {
  userOwnsList: boolean;
}

const App: React.FC<IListPreviewProps> = ({ userOwnsList }) => {
  const navigate = useNavigate();
  const userContext = useUserContext();
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
    return;
  };

  const showUserListsOnly = (userOwnsList: boolean) => {
    return lists.filter(list => (userOwnsList ? list.ownerId === userId : list.ownerId !== userId));
  };

  return (
    <div style={{ maxWidth: "50%", margin: "auto" }}>
      <List
        className="list-preview"
        loading={loading}
        itemLayout="horizontal"
        dataSource={showUserListsOnly(userOwnsList)}
        renderItem={({ listName, _id: listId }: IList) => (
          <List.Item
            style={{ paddingRight: "10px" }}
            actions={[
              <a key="list-loadmore-edit" onClick={() => goToList(listId)}>
                view
              </a>,
            ]}
          >
            <Skeleton title={false} loading={loading} active>
              <List.Item.Meta
                style={{ paddingLeft: "10px" }}
                title={
                  <a href={`/lists/${listId}`}>
                    <Title key={listId} level={5}>
                      {listName}
                    </Title>
                  </a>
                }
              />
            </Skeleton>
          </List.Item>
        )}
      />
    </div>
  );
};

export default App;
