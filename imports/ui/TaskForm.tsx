import React, { useState } from 'react';
import { TasksCollection } from '../api/collections/TasksCollection';
import { useTracker } from 'meteor/react-meteor-data';
import { useUserContext } from "../../context/UserContext"
import { Meteor } from 'meteor/meteor';
import { Task } from './Task';


const TaskForm = () => {
  const userContext = useUserContext();
  const { _id: userId } = userContext.state ?? {};
  const [text, setText] = useState("");

  const { tasks } = useTracker(() => {

    const noDataAvailable = { tasks: [], pendingTasksCount: 0 };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe('tasks');
    console.log(handler.ready());

    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    console.log("am i being called????")

    // is this using the handler? 
    const tasks = TasksCollection.find(
      { userId },
      {
        sort: { createdAt: -1 },
      }
    ).fetch();

    return { loading: false, tasks };
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text) return;
    //  TasksCollection.insert({
    //       text: text.trim(),
    //       createdAt: new Date()

    //     });

    // Meteor.call('tasks.insert', text);
    // setText("");
    Meteor.call('tasks.insert', text, (error: Meteor.Error | null, result: Meteor.User) => {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("task insert result ", result)
        setText("");
      }
    })

  };
  console.log(tasks)

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