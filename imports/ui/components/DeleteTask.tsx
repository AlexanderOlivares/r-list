import React from "react";
import { message, Popconfirm } from "antd";
import { Meteor } from "meteor/meteor";

interface IDeleteTaskProps {
  taskId: string;
  showDeleteTaskConfirm: boolean;
  setShowDeleteTaskConfirm: React.Dispatch<React.SetStateAction<boolean>>;
}

function DeleteTask({ taskId, showDeleteTaskConfirm, setShowDeleteTaskConfirm }: IDeleteTaskProps) {
  const confirm = (taskId: string) => {
    Meteor.call("tasks.delete", taskId, (error: Meteor.Error, result: string) => {
      if (error) {
        message.error(error.error);
      } else {
        console.log("task deleted result ", result);
        message.success(result);
      }
      setShowDeleteTaskConfirm(false);
    });
  };

  const cancel = () => {
    setShowDeleteTaskConfirm(false);
  };

  return (
    <Popconfirm
      title="Delete the task"
      placement="top"
      onConfirm={() => confirm(taskId)}
      onCancel={cancel}
      okText="Yes"
      cancelText="No"
      visible={showDeleteTaskConfirm}
    ></Popconfirm>
  );
}

export default DeleteTask;
