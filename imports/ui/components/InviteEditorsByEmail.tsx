import React, { useState } from "react";
import { Button, Input, Typography, message } from "antd";
import { EMAIL_VALIDATOR } from "../utils";
const { Text } = Typography;

interface IProps {
  setEditorsUsernames: React.Dispatch<React.SetStateAction<string[]>>;
  tags: string[];
}

export default function InviteEditorsByEmail({ tags, setEditorsUsernames }: IProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = (e?: React.KeyboardEvent<HTMLInputElement> | null) => {
    if (e) e.preventDefault();

    if (!EMAIL_VALIDATOR.test(inputValue)) {
      return message.error("Invalid email address format");
    }

    if (inputValue && tags.indexOf(inputValue) === -1) {
      setEditorsUsernames((prev) => [...prev, inputValue]);
    }

    setInputValue("");
  };

  const clickConfirm = () => handleInputConfirm(null);

  return (
    <>
      <Input
        type="email"
        size="middle"
        className="tag-input"
        value={inputValue}
        onChange={handleInputChange}
        onPressEnter={(e) => handleInputConfirm(e)}
        placeholder="friend@email.com"
      />
      <div style={{ marginTop: "20px" }}>
        <Button size="small" onClick={() => clickConfirm()}>
          <Text>Add email</Text>
        </Button>
      </div>
    </>
  );
}
