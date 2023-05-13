import React, { useState } from 'react';
import { TasksCollection } from '../api/collections/TasksCollection';

const TaskForm = () => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text) return;

    TasksCollection.insert({
      text: text.trim(),
      createdAt: new Date()
    });

    setText("");
  };

  console.log(text)

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        type="text"
        placeholder="Type to add new tasks"
      />

      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;