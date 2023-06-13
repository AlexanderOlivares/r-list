import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { Modal, Input, Typography, message, InputRef } from "antd";
const { Text } = Typography;
import { ITask } from "/imports/api/collections/TasksCollection";
import { Meteor } from "meteor/meteor";

interface IEditTaskModalProps {
  task: ITask;
  showEditTaskModal: boolean;
  setShowEditTaskModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditTaskModal: React.FC<IEditTaskModalProps> = ({
  task,
  showEditTaskModal,
  setShowEditTaskModal,
}) => {
  const { text, lastEditedAt, lastEditedBy } = task;
  const [inputText, setInputText] = useState(text);
  const editInputRef = useRef<InputRef | null>(null);

  const handleOk = () => {
    const updatedTask: ITask = {
      ...task,
      text: inputText,
    };

    Meteor.call("tasks.edit", updatedTask, (error: Meteor.Error, result: string) => {
      if (error) {
        message.error(error.error);
      } else {
        message.success(result);
      }
      setShowEditTaskModal(false);
    });
  };

  const handleCancel = () => {
    setShowEditTaskModal(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  useEffect(() => {
    showEditTaskModal && editInputRef.current?.focus();
  }, []);

  return (
    <>
      <Modal
        keyboard={true}
        title="Edit task"
        open={showEditTaskModal}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          style={{ marginBottom: "10px" }}
          maxLength={200}
          size="large"
          defaultValue={text}
          onChange={handleChange}
          onPressEnter={handleOk}
          ref={editInputRef}
        />
        <Text type="secondary">{`last edited by ${lastEditedBy}`}</Text>
        <br />
        <Text type="secondary">{`at ${lastEditedAt.toLocaleString()}`}</Text>
      </Modal>
    </>
  );
};

export default EditTaskModal;
