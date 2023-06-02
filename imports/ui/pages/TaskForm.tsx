import React, { useState } from "react";
import { TasksCollection } from "../../api/collections/TasksCollection";
import { useTracker } from "meteor/react-meteor-data";
import { useUserContext } from "../../../context/UserContext";
import { Meteor } from "meteor/meteor";
import { Task } from "../components/Task";
import { useParams } from "react-router-dom";
import { ListsCollection } from "../../api/collections/ListsCollection";
import { IEditor } from "../components/NewList";
import Title from "antd/lib/typography/Title";

const TaskForm = () => {
  const userContext = useUserContext();
  const { _id: userId } = userContext.state ?? {};
  const [text, setText] = useState("");
  const { listId } = useParams();

  const { list, tasks, isListOwner } = useTracker(() => {
    const noDataAvailable = { list: undefined, tasks: [], isListOwner: false, isLoading: false };

    if (!userId) return noDataAvailable;

    const handler = Meteor.subscribe("tasks");
    const listHandler = Meteor.subscribe("lists");

    if (!handler.ready() || !listHandler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    const tasks = TasksCollection.find(
      { listId },
      {
        sort: { createdAt: -1 },
      }
    ).fetch();

    const list = ListsCollection.findOne(
      { _id: listId },
      {
        sort: { createdAt: -1 },
      }
    );

    if (!list) return noDataAvailable;

    const isListOwner = list.ownerId === userId;

    return { list, isLoading: false, tasks, isListOwner };
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text) return;

    const task = {
      text,
      listId,
      userId,
      lastEditedBy: userId,
      lastEditedAt: new Date(),
    };

    Meteor.call("tasks.insert", task, (error: Meteor.Error, result: Meteor.User) => {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("task insert result ", result);
        setText("");
      }
    });
  };

  const banUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    const usernameOrEmail = e.currentTarget.textContent;
    const banUserProps = {
      usernameOrEmail,
      listId,
    };
    Meteor.call("lists.banEditor", banUserProps, (error: Meteor.Error) => {
      if (error) {
        console.log(error.reason);
      } else {
        console.log(`${usernameOrEmail} was banned from this list`);
      }
    });
  };

  return (
    <>
      <div>
        <Title level={1}>{list?.listName}</Title>
      </div>
      <div>
        <Title level={4}>{"Editors"}</Title>
        {list?.editors.map((editor: IEditor, i: number) => (
          <p key={`${editor.email}-${i}`}>
            {editor.editorUsername ? editor.editorUsername : editor.email}
          </p>
        ))}
      </div>
      {isListOwner && (
        <div style={{ marginBottom: "10px" }}>
          <Title level={4}>{"Ban Users"}</Title>
          {list?.editors.map((editor: IEditor, i: number) => (
            <button onClick={banUser} key={`${editor.email}+${i}`}>
              {editor.editorUsername ? editor.editorUsername : editor.email}
            </button>
          ))}
        </div>
      )}
      <form className="task-form" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          type="text"
          placeholder="Type to add new tasks"
        />

        <button type="submit">Add Task</button>
      </form>
      {tasks.length > 0 && (
        <div>
          <ul>
            {tasks.map((task) => {
              return <Task key={task._id} task={task} />;
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default TaskForm;
