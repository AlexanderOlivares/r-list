import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Button, Form, Input, Checkbox, Tag, message, Typography } from "antd";
import { onFinishFailed } from "../pages/Login";
import InviteEditors from "./InviteEditors";
import Title from "antd/lib/typography/Title";
import InviteEditorsByEmail from "./InviteEditorsByEmail";
import { buildEditorBase } from "../utils";
const { Text } = Typography;

export interface IEditor {
  email?: string;
  // Editor may not have account yet
  editorId?: string;
  editorUsername?: string;
}

export interface INewList {
  listName: string;
  editors: IEditor[];
  editorsCanInvite: boolean;
}

export default function NewList() {
  const navigate = useNavigate();
  const [editors, setEditors] = useState<string[]>([]);

  const makeNewList = (e: INewList) => {
    const { listName, editorsCanInvite } = e;

    (async () => {
      const formattedEditors: IEditor[] = await Promise.all(
        editors.map(async (usernameOrEmail) => {
          return buildEditorBase(usernameOrEmail);
        })
      );

      const newList: INewList = {
        listName,
        editors: formattedEditors,
        editorsCanInvite,
      };

      Meteor.call("lists.insert", newList, (error: Meteor.Error, result: string) => {
        if (error) {
          console.log(error.reason);
          message.error("Error creating list");
        } else {
          const listId = result;
          navigate(`/lists/${listId}`);
        }
      });
    })();
  };

  const handleClose = (removedTag: string, tagList: string[]) => {
    const newTags = tagList.filter((tag) => tag !== removedTag);
    setEditors(newTags);
  };

  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ editorsCanInvite: true }}
        onFinish={makeNewList}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          style={{ maxWidth: "80%", margin: "auto", paddingBottom: "20px" }}
          wrapperCol={{ span: 12, offset: 0 }}
          label="List name"
          name="listName"
          rules={[
            { required: true, message: "Please name your list" },
            { max: 30, message: "List name cannot exceed 30 characters" },
          ]}
        >
          <Input size="middle" />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Title level={3}>Invite Friends to Edit</Title>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          {editors.map((tag) => {
            return (
              <Tag
                className="edit-tag"
                key={tag}
                closable={true}
                onClose={() => handleClose(tag, editors)}
              >
                {tag}
              </Tag>
            );
          })}
        </div>
        <Form.Item
          style={{ maxWidth: "80%", margin: "auto", paddingBottom: "20px" }}
          wrapperCol={{ span: 12, offset: 0 }}
          label="by email"
          name="editors"
        >
          <InviteEditorsByEmail tags={editors} setEditorsUsernames={setEditors} />
        </Form.Item>
        <Form.Item
          style={{ maxWidth: "80%", margin: "auto", paddingBottom: "20px" }}
          wrapperCol={{ span: 12, offset: 0 }}
          label="by username"
          name="editors"
        >
          <InviteEditors setEditorUsernameTags={setEditors} />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Text>Editors can invite others</Text>
        </div>
        <Form.Item
          style={{ display: "flex", justifyContent: "center" }}
          name="editorsCanInvite"
          valuePropName="checked"
        >
          <Checkbox></Checkbox>
        </Form.Item>
        <Form.Item style={{ display: "flex", justifyContent: "center" }}>
          <Button type="primary" htmlType="submit">
            create list
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
