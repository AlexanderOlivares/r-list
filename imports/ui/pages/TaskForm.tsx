import React, { useEffect, useState } from "react";
import { ITask, TasksCollection } from "../../api/collections/TasksCollection";
import { useTracker } from "meteor/react-meteor-data";
import { useUserContext } from "../../../context/UserContext";
import { Meteor } from "meteor/meteor";
import { useNavigate, useParams } from "react-router-dom";
import { ListsCollection } from "../../api/collections/ListsCollection";
import { IEditor } from "../components/NewList";
import Title from "antd/lib/typography/Title";
import {
  Avatar,
  Tooltip,
  Button,
  Form,
  Input,
  List,
  Skeleton,
  Typography,
  Modal,
  message,
  Select,
} from "antd";
import { onFinishFailed } from "./Login";
import DeleteTask from "../components/DeleteTask";
import EditTaskModal from "../components/EditTaskModal";
import { avatarHexColors } from "../constants/avatarHexColors";
import { SettingOutlined } from "@ant-design/icons";
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [renameList, setRenameList] = useState("");
  const [editorsEmailOrUsername, setEditorsEmailOrUsername] = useState<string[]>([]);
  const [usersToBan, setUsersToBan] = useState<string[]>([]);

  const { list, tasks, isListOwner } = useTracker(() => {
    const taskArray: ITask[] = [];
    const noDataAvailable = {
      list: undefined,
      tasks: taskArray,
      isListOwner: false,
      isLoading: false,
    };

    if (!userId || !listId) return noDataAvailable;

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
      creatorUserId: userId,
      creatorUsername: username,
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

  const deleteTask = (taskId: string) => {
    setShowDeleteTaskConfirm(true);
    setTaskToDelete(taskId);
  };

  const editTask = (taskId: string) => {
    setShowEditTaskModal(true);
    setTaskToEdit(taskId);
  };

  const openSettings = () => setShowSettingsModal(true);

  const formatListMetadata = (task: ITask) => {
    const { creatorUsername, lastEditedAt, createdAt, lastEditedBy } = task;
    const createdAtReadable = createdAt.toLocaleString();
    const lastEditedAtReadable = lastEditedAt.toLocaleString();
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {createdAtReadable === lastEditedAtReadable ? (
          <Text type="secondary">{`created by ${creatorUsername}`}</Text>
        ) : (
          <Text type="secondary">{`edited by ${lastEditedBy}`}</Text>
        )}
        <Text type="secondary">{`at ${lastEditedAtReadable}`}</Text>
      </div>
    );
  };

  const handleSettingsModalOk = () => {
    // rename list
    if (list && list.listName !== renameList) {
      const renamedList = { _id: listId, newName: renameList };
      Meteor.call("lists.rename", renamedList, (error: Meteor.Error, result: string) => {
        if (error) {
          message.error(error.error);
        } else {
          message.success(result);
        }
      });
    }

    // ban user(s)
    if (usersToBan.length) {
      const banUserProps = { usersToBan, listId };
      Meteor.call("lists.banEditors", banUserProps, (error: Meteor.Error, result: number) => {
        if (error) {
          message.error(error.error);
        } else {
          message.success(`${result} user${result > 1 ? "s" : ""} banned`);
        }
      });
    }

    setShowSettingsModal(false);
  };

  const handleCancel = () => setShowSettingsModal(false);

  const handleRenameListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRenameList(e.target.value);
  };

  const deleteList = () => {
    Meteor.call("lists.delete", listId, (error: Meteor.Error, result: string) => {
      if (error) {
        message.error(error.error);
      } else {
        message.success(result);
        navigate(`/profile/${username}`);
      }
    });
  };

  useEffect(() => {
    if (list && list.listName !== renameList) {
      setRenameList(renameList);
    }
  }, [list]);

  useEffect(() => {
    if (list?.editors) {
      const emailOrUsernames = list.editors
        .map((editor) => editor.editorUsername || editor.email)
        .filter((editor) => editor && !usersToBan.includes(editor)) as string[];
      setEditorsEmailOrUsername(emailOrUsernames);
    }
  }, [showSettingsModal]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Title level={1}>{list?.listName}</Title>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <Button onClick={openSettings} size="small" icon={<SettingOutlined />}>
          list settings
        </Button>
      </div>
      <Modal
        title="List Settings"
        open={showSettingsModal}
        onOk={handleSettingsModalOk}
        onCancel={handleCancel}
      >
        {isListOwner || (list?.editorsCanInvite && <Text>Invite Editors</Text>)}
        {isListOwner && (
          <>
            <div>
              <Title level={5}>Rename List</Title>
              <Input
                style={{ marginBottom: "10px" }}
                maxLength={30}
                size="large"
                defaultValue={list?.listName}
                onChange={handleRenameListChange}
                onPressEnter={handleSettingsModalOk}
              />
            </div>
            <div style={{ margin: "10px" }}>
              <Title level={5}>{"Ban User(s)"}</Title>
            </div>
            <div>
              <Select
                mode="multiple"
                placeholder="Inserted are removed"
                value={usersToBan}
                onChange={setUsersToBan}
                style={{ width: "100%" }}
                options={editorsEmailOrUsername
                  .filter((user) => !usersToBan.includes(user))
                  .map((item) => ({
                    value: item,
                    label: item,
                  }))}
              />
            </div>
            <div style={{ margin: "10px" }}>
              <Button danger size="small" onClick={deleteList}>
                Delete List
              </Button>
            </div>
          </>
        )}
      </Modal>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Title level={4}>{"Editors"}</Title>
      </div>
      <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
        {list && (
          <Avatar.Group maxCount={4} maxPopoverTrigger="click" size="large">
            <Tooltip key={list.ownerId} title={list.ownerUsername} placement="top">
              <Avatar style={{ backgroundColor: avatarHexColors[0] }}>
                {list.ownerUsername[0].toLocaleUpperCase()}
              </Avatar>
            </Tooltip>
            {list?.editors.map((editor: IEditor, i: number) => {
              const emailOrUsername = editor.editorUsername ?? editor.email;
              const initial = emailOrUsername?.[0];
              return (
                <Tooltip key={emailOrUsername} title={emailOrUsername} placement="top">
                  <Avatar style={{ backgroundColor: avatarHexColors[i + 1] || "#f56a00" }}>
                    {initial?.toUpperCase()}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        )}
      </div>
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
                  description={formatListMetadata(task)}
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
