import React from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { onFinishFailed } from "../pages/Login";
import { useUserContext } from "../../../context/UserContext";

interface ISignupFormProps {
  email: string;
  username: string;
  password: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();

  const handleSubmit = (e: ISignupFormProps) => {
    const user = e;

    Meteor.call("user.addUser", user, (error: Meteor.Error | null, res: Meteor.User | null) => {
      if (error) {
        console.log(error.reason);
        throw new Meteor.Error("create-user-error", "Error reating user");
      } else {
        if (!res) return navigate(`/`);
        const { username } = res;
        console.log(`User added with ID ${res._id}`);
        userContext.dispatch({
          type: "login",
          payload: res,
        });
        navigate(`/profile/${username}`);
      }
    });
  };

  return (
    <div id="signup-form">
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          wrapperCol={{ span: 8, offset: 0 }}
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            {
              type: "email",
              message: "Please enter a valid email address!",
            },
          ]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          wrapperCol={{ span: 8, offset: 0 }}
          label="Username"
          name="username"
          rules={[
            { required: true, message: "Please input your username!" },
            {
              min: 6,
              message: "Username must be at least 6 characters long!",
            },
            {
              max: 20,
              message: "Username cannot exceed 20 characters!",
            },
          ]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          wrapperCol={{ span: 8, offset: 0 }}
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            {
              min: 6,
              message: "Password must be at least 6 characters long!",
            },
            {
              max: 20,
              message: "Password cannot exceed 20 characters!",
            },
          ]}
        >
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button type="primary" htmlType="submit">
              signup
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Signup;
