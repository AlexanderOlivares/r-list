import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Button, Form, Input, Checkbox, Tag } from "antd";
import { onFinishFailed } from "../pages/Login";
import InviteEditors from "./InviteEditors";
import Title from "antd/lib/typography/Title";
import InviteEditorsByEmail from "./InviteEditorsByEmail";

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
  const [editorsUsernames, setEditorsUsernames] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const EMAIL_VALIDATOR = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

  const makeNewList = (e: INewList) => {
    const { listName, editorsCanInvite } = e;

    const inValidEmailAddresses = tags.filter((email) => !EMAIL_VALIDATOR.test(email));

    if (inValidEmailAddresses.length) {
      throw new Error("One or more email address is in an invalid format");
    }

    const editorUsernamesOrEmails = [...tags, ...editorsUsernames];

    // TODO MAKE THIS IT'S OWN FUNC
    (async () => {
      const editors: IEditor[] = await Promise.all(
        editorUsernamesOrEmails.map(async (usernameOrEmail) => {
          // TODO MAKE THIS IT'S OWN FUNC
          const isEmail = (usernameOrEmail: string) => /@/g.test(usernameOrEmail);
          const email = isEmail(usernameOrEmail);

          const editorBase: IEditor = {
            ...(email ? { email: usernameOrEmail } : { editorUsername: usernameOrEmail }),
          };

          try {
            let editorId, editorUsername;

            await new Promise<Meteor.User>((resolve, reject) => {
              Meteor.call(
                "user.findUser",
                usernameOrEmail,
                (error: Meteor.Error, result: Meteor.User) => {
                  if (error) {
                    console.log(error.reason);
                    reject(error.reason);
                  } else {
                    editorId = result._id;
                    editorUsername = result.username;
                    resolve(result);
                  }
                }
              );
            });

            return {
              ...editorBase,
              ...(editorId ? { editorId } : {}),
              ...(editorUsername ? { editorUsername } : {}),
            };
          } catch (error) {
            console.log(error);
            return editorBase;
          }
        })
      );

      const newList: INewList = {
        listName,
        editors,
        editorsCanInvite,
      };

      Meteor.call("lists.insert", newList, (error: Meteor.Error, result: string) => {
        if (error) {
          console.log(error.reason);
        } else {
          const listId = result;
          navigate(`/lists/${listId}`);
        }
      });
    })();
  };

  const handleClose = (removedTag: string, tagList: string[], tagName: string) => {
    const newTags = tagList.filter((tag) => tag !== removedTag);
    if (tagName === "tags") setTags(newTags);
    if (tagName === "editorsUsernames") setEditorsUsernames(newTags);
  };

  return (
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
        <Title level={4}>Invite Friends to Edit</Title>
      </div>
      <Form.Item
        style={{ display: "flex", justifyContent: "center" }}
        wrapperCol={{ span: 12, offset: 0 }}
        name="editors"
      >
        <InviteEditorsByEmail
          tags={tags}
          setTags={setTags}
          setEditorsUsernames={setEditorsUsernames}
        />
      </Form.Item>
      <div style={{ marginBottom: "10px" }}>
        {editorsUsernames.map((tag) => {
          // FIXME styling is crap
          return (
            <Tag
              className="edit-tag"
              key={tag}
              closable={true}
              onClose={() => handleClose(tag, editorsUsernames, "editorsUsernames")}
            >
              {tag}
            </Tag>
          );
        })}
      </div>
      <Form.Item
        style={{ maxWidth: "80%", margin: "auto", paddingBottom: "20px" }}
        wrapperCol={{ span: 12, offset: 0 }}
        label="Search for friends"
        name="editors"
      >
        <InviteEditors setEditorUsernameTags={setEditorsUsernames} />
      </Form.Item>
      <Form.Item
        style={{ display: "flex", justifyContent: "center" }}
        name="editorsCanInvite"
        valuePropName="checked"
      >
        <Checkbox>Editors can invite others</Checkbox>
      </Form.Item>
      <Form.Item style={{ display: "flex", justifyContent: "center" }}>
        <Button type="primary" htmlType="submit">
          create list
        </Button>
      </Form.Item>
    </Form>
  );
}
