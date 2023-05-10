import React, { useState } from 'react';
import SignupForm from "./SignupForm"
import Profile from "./Profile"
import { Task } from './Task';
import TaskForm from './TaskForm';
import { useTracker } from 'meteor/react-meteor-data';
import { TasksCollection } from '../api/TasksCollection';

export const App = () => {
  const tasks = useTracker(() => TasksCollection.find({}).fetch());
  const user = useTracker(() => Meteor.user());

  const [task, setTask] = useState("");

  function handleInputChange(event) {
    setTask(event.target.value);
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    console.log(task);
    tasks.push({ _id: Math.random(), text: task });
    // add the task to your state or send it to a server
  }


  return (

    <div className="main">
      {user ? (
        <>
          <TaskForm />

          {/* <div className="filter">
          <button onClick={() => setHideCompleted(!hideCompleted)}>
            {hideCompleted ? 'Show All' : 'Hide Completed'}
          </button>
        </div> */}

          <ul className="tasks">
            {tasks.map(task => (
              <Task
                key={task._id}
                task={task}
              // onCheckboxClick={toggleChecked}
              // onDeleteClick={deleteTask}
              />
            ))}
          </ul>
        </>
      ) : (
        <SignupForm />
      )}
    </div>

  )
};
