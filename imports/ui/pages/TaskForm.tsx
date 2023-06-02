import React from "react";
import { ITask, TasksCollection } from "../../api/collections/TasksCollection";
import { useTracker } from "meteor/react-meteor-data";
import { useUserContext } from "../../../context/UserContext";
import { Meteor } from "meteor/meteor";
import { Task } from "../components/Task";
import { useNavigate, useParams } from "react-router-dom";
import { ListsCollection } from "../../api/collections/ListsCollection";
import { IEditor } from "../components/NewList";
import Title from "antd/lib/typography/Title";
import { Button, Form, Input } from "antd";
import { onFinishFailed } from "./Login";

const TaskForm = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();
  const { _id: userId, username } = userContext.state ?? {};
  const [form] = Form.useForm();
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

  const handleSubmit = ({ text }: { text: string }) => {
    if (!text) return;

    if (!userId || !username || !listId) {
      return navigate("/");
    }

    const task: Partial<ITask> = {
      text,
      listId,
      userId,
      username,
      lastEditedBy: userId,
      lastEditedAt: new Date(),
    };

    Meteor.call("tasks.insert", task, (error: Meteor.Error, result: Meteor.User) => {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("task insert result ", result);
        form.resetFields();
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
      <div style={{ display: "flex", justifyContent: "center" }}>
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
      <Form
        form={form}
        name="basic"
        style={{
          maxWidth: 600,
          margin: "auto",
        }}
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="text"
          name="text"
          rules={[
            { required: true, message: "List item cannot be empty" },
            {
              max: 200,
              message: "Input cannot exceed 200 characters",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            add to list
          </Button>
        </Form.Item>
      </Form>
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
