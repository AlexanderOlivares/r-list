import React from "react";
import { ITask } from "/imports/api/collections/TasksCollection";

interface ITaskProps {
  task: ITask;
}

export const Task = ({ task: { _id, text, userId } }: ITaskProps) => {
  return (
    <>
      <div id={_id}>
        <span>{text}</span>
        <span>
          <button>Edit</button>
        </span>
        <span>
          <button>Delete</button>
        </span>
      </div>
      <div>
        <p>last edited by {userId}</p>
      </div>
    </>
  );
};
