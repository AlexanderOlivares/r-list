import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Button, Form, Input, Checkbox, Tag, Tooltip } from "antd";
import { onFinishFailed } from "../pages/Login";
import InviteEditors from "./InviteEditors";
import type { InputRef } from "antd";
import { PlusOutlined } from "@ant-design/icons";

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
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  const EMAIL_VALIDATOR = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  const makeNewList = (e: INewList) => {
    const { listName, editorsCanInvite } = e;

    const inValidEmailAddresses = tags.filter(email => !EMAIL_VALIDATOR.test(email));

    if (inValidEmailAddresses.length) {
      throw new Error("One or more email address is in an invalid format");
    }

    const editorUsernamesOrEmails = [...tags, ...editorsUsernames];

    (async () => {
      const editors: IEditor[] = await Promise.all(
        editorUsernamesOrEmails.map(async usernameOrEmail => {
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
                    reject(error);
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

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [inputValue]);

  const handleClose = (removedTag: string, tagList: string[], tagName: string) => {
    const newTags = tagList.filter(tag => tag !== removedTag);
    if (tagName === "tags") setTags(newTags);
    if (tagName === "editorsUsernames") setEditorsUsernames(newTags);
  };

  const showInput = () => setInputVisible(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = () => {
    const newTags = [...tags];
    newTags[editInputIndex] = editInputValue;
    setTags(newTags);
    setEditInputIndex(-1);
    setInputValue("");
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
        wrapperCol={{ span: 12, offset: 0 }}
        label="List name"
        name="listName"
        rules={[{ required: true, message: "Please name your list" }]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item wrapperCol={{ span: 12, offset: 0 }} label="by email" name="editors">
        {tags.map((tag, index) => {
          if (editInputIndex === index) {
            return (
              <Input
                ref={editInputRef}
                key={tag}
                size="small"
                className="tag-input"
                value={editInputValue}
                onChange={handleEditInputChange}
                onBlur={handleEditInputConfirm}
                onPressEnter={handleEditInputConfirm}
              />
            );
          }

          const isLongTag = tag.length > 20;

          const tagElem = (
            <Tag
              className="edit-tag"
              key={tag}
              closable={true}
              onClose={() => handleClose(tag, tags, "tags")}
            >
              <span
                onDoubleClick={e => {
                  if (index !== 0) {
                    setEditInputIndex(index);
                    setEditInputValue(tag);
                    e.preventDefault();
                  }
                }}
              >
                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
              </span>
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}
        {inputVisible && (
          <Input
            ref={inputRef}
            type="email"
            size="small"
            className="tag-input"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag className="site-tag-plus" onClick={showInput}>
            <PlusOutlined /> add editor email
          </Tag>
        )}
      </Form.Item>

      <div style={{ marginBottom: "10px" }}>
        {editorsUsernames.map((tag, index) => {
          return (
            <Tag
              className="edit-tag"
              key={tag}
              closable={true}
              onClose={() => handleClose(tag, editorsUsernames, "editorsUsernames")}
            >
              <span
                onDoubleClick={e => {
                  if (index !== 0) {
                    setEditInputIndex(index);
                    setEditInputValue(tag);
                    e.preventDefault();
                  }
                }}
              >
                {tag}
              </span>
            </Tag>
          );
        })}
      </div>

      <Form.Item wrapperCol={{ span: 12, offset: 0 }} label="by username" name="editors">
        <InviteEditors setEditorUsernameTags={setEditorsUsernames} />
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
          <Button type="ghost">add editor</Button>
        </div>
      </Form.Item>

      <Form.Item
        name="editorsCanInvite"
        valuePropName="checked"
        wrapperCol={{ offset: 0, span: 16 }}
        style={{ marginTop: "20px" }}
      >
        <Checkbox>Editors can invite others</Checkbox>
      </Form.Item>

      <Form.Item>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button type="primary" htmlType="submit">
            create list
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
