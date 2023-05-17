import React, { useState } from 'react';
import { TasksCollection } from '../api/collections/TasksCollection';
import { useTracker } from 'meteor/react-meteor-data';
import { useUserContext } from "../../context/UserContext"
import { Meteor } from 'meteor/meteor';
import { Task } from './Task';
import { useParams } from 'react-router-dom';


const TaskForm = () => {
  const userContext = useUserContext();
  const { _id: userId } = userContext.state ?? {};
  const [text, setText] = useState("");
  const { listId } = useParams();


  const { tasks } = useTracker(() => {

    const noDataAvailable = { tasks: [], pendingTasksCount: 0 };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe('tasks');

    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    const tasks = TasksCollection.find(
      { listId },
      {
        sort: { createdAt: -1 },
      }
    ).fetch();

    return { loading: false, tasks };
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text) return;

    const task = {
      text,
      listId,
      userId,
      lastEditedBy: userId,
      lastEditedAt: new Date,

    }

    Meteor.call('tasks.insert', task, (error: Meteor.Error, result: Meteor.User) => {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("task insert result ", result)
        setText("");
      }
    })

  };

  return (
    <>
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
              return (
                <Task key={task._id} props={task} />
              )
            })
            }
          </ul>
        </div>
      )}
    </>
  );
};

export default TaskForm;