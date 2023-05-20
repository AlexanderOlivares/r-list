import React from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { Button, Form, Input } from "antd";

interface ILoginFormProps {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();

  const goToSignup = () => navigate("/signup");

  const handleSubmit = (e: ILoginFormProps) => {
    const { email, password } = e;

    Meteor.loginWithPassword(email, password, error => {
      if (error) {
        console.log(error.message);
      } else {
        console.log(`Login success`);
        const user = Meteor.user();
        if (!user) return navigate(`/`);
        userContext.dispatch({
          type: "login",
          payload: user,
        });
        navigate(`/profile/${user.username}`);
      }
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div style={{ width: "100%" }}>
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
        {/* <Form.Item
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
      </Form.Item> */}

        <Form.Item
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
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
