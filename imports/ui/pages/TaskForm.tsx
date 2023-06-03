import React, { useState } from "react";
import { ITask, TasksCollection } from "../../api/collections/TasksCollection";
import { useTracker } from "meteor/react-meteor-data";
import { useUserContext } from "../../../context/UserContext";
import { Meteor } from "meteor/meteor";
import { useNavigate, useParams } from "react-router-dom";
import { ListsCollection } from "../../api/collections/ListsCollection";
import { IEditor } from "../components/NewList";
import Title from "antd/lib/typography/Title";
import { Button, Form, Input, List, Skeleton, Typography } from "antd";
import { onFinishFailed } from "./Login";
import DeleteTask from "../components/DeleteTask";
import EditTaskModal from "../components/EditTaskModal";
const { Text } = Typography;

const TaskForm = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();
  const { _id: userId, username } = userContext.state ?? {};
  const [form] = Form.useForm();
  const { listId } = useParams();
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string>("");
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<string>("");

  const { list, tasks, isListOwner } = useTracker(() => {
    const taskArray: ITask[] = [];
    const noDataAvailable = {
      list: undefined,
      tasks: taskArray,
      isListOwner: false,
      isLoading: false,
    };

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
      lastEditedBy: username,
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

  const deleteTask = (taskId: string) => {
    setShowDeleteTaskConfirm(true);
    setTaskToDelete(taskId);
  };

  const editTask = (taskId: string) => {
    setShowEditTaskModal(true);
    setTaskToEdit(taskId);
  };

  const formatMetadata = (task: ITask) => {
    const { username, lastEditedAt, createdAt, lastEditedBy } = task;
    const createdAtReadable = createdAt.toLocaleString();
    const lastEditedAtReadable = lastEditedAt.toLocaleString();
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {createdAtReadable === lastEditedAtReadable ? (
          <Text type="secondary">{`created by: ${username}`}</Text>
        ) : (
          <Text type="secondary">{`edited by: ${lastEditedBy}`}</Text>
        )}
        <Text type="secondary">{`last edit: ${lastEditedAtReadable}`}</Text>
      </div>
    );
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
      <div style={{ display: "flex", justifyContent: "center" }}>
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

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                add to list
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
      <div style={{ margin: "5px" }}>
        <List
          className="demo-loadmore-list"
          loading={false}
          itemLayout="horizontal"
          dataSource={tasks}
          size="large"
          renderItem={(task) => (
            <List.Item
              actions={[
                <a key="task-list-edit" onClick={() => editTask(task._id)}>
                  edit
                </a>,
                <a key="task-list-delete" onClick={() => deleteTask(task._id)}>
                  delete
                </a>,
              ]}
            >
              <Skeleton avatar title={false} loading={false} active>
                <List.Item.Meta
                  title={<a href="https://ant.design">{task.text}</a>}
                  description={formatMetadata(task)}
                />
                {taskToDelete == task._id && showDeleteTaskConfirm && (
                  <DeleteTask
                    taskId={taskToDelete}
                    showDeleteTaskConfirm={showDeleteTaskConfirm}
                    setShowDeleteTaskConfirm={setShowDeleteTaskConfirm}
                  />
                )}
                {taskToEdit == task._id && showEditTaskModal && (
                  <EditTaskModal
                    task={task}
                    showEditTaskModal={showEditTaskModal}
                    setShowEditTaskModal={setShowEditTaskModal}
                  />
                )}
              </Skeleton>
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export default TaskForm;
