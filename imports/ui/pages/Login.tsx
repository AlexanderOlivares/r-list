import React from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { Button, Form, Input } from "antd";
import { ValidateErrorEntity } from "rc-field-form/es/interface";

export const onFinishFailed = (errorInfo: ValidateErrorEntity) => {
  // TODO display error toast
  console.log("Failed:", errorInfo);
};

interface ILoginFormProps {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();

  const handleSubmit = (e: ILoginFormProps) => {
    const { email, password } = e;

    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Login success");
        const user = Meteor.user();
        if (!user) return navigate("/");
        userContext.dispatch({
          type: "login",
          payload: user,
        });
        navigate(`/profile/${user.username}`);
      }
    });
  };

  return (
    <div id="login-form">
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
              login
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
