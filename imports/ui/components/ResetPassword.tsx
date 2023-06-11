import { Button, Input, Modal, message } from "antd";
import React, { useState } from "react";
import { EMAIL_VALIDATOR } from "../utils";
import { Meteor } from "meteor/meteor";

const ResetPassword: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    if (!EMAIL_VALIDATOR.test(email)) {
      message.error("Invalid email format");
    }

    Meteor.call("user.requestPasswordReset", email, (error: Meteor.Error, result: string) => {
      if (error) {
        message.error(error.error);
      } else {
        message.success(result);
      }
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <>
      <Button type="ghost" onClick={showModal}>
        Reset Password
      </Button>
      <Modal
        title="Email me a password reset link"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          type="email"
          size="middle"
          className="reset-password-input"
          value={email}
          onChange={handleInputChange}
          onPressEnter={handleOk}
          placeholder="yourEmail@email.com"
        />
      </Modal>
    </>
  );
};

export default ResetPassword;
