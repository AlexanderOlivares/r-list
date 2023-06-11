import React from "react";
import { Meteor } from "meteor/meteor";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { Button, Form, Input, message } from "antd";
import { ValidateErrorEntity } from "rc-field-form/es/interface";
import ResetPassword from "../components/ResetPassword";
import { Accounts } from "meteor/accounts-base";
import Title from "antd/lib/typography/Title";

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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPasswordReset = searchParams.get("passwordReset");
  const token = searchParams.get("token");

  const navigateOnSuccess = () => {
    const user = Meteor.user();
    if (!user) return navigate("/");
    userContext.dispatch({
      type: "login",
      payload: user,
    });
    navigate(`/profile/${user.username}`);
  };

  const handleSubmit = (e: ILoginFormProps) => {
    const { email, password } = e;

    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Login success");
        navigateOnSuccess();
      }
    });
  };

  const handlePasswordReset = (e: ILoginFormProps) => {
    const { password } = e;
    if (!token) return;

    Accounts.resetPassword(token, password, (error) => {
      if (error) {
        console.log(error);
        message.error("Error resetting your password");
      } else {
        message.success("Password was reset");
        navigateOnSuccess();
      }
    });
  };

  return (
    <div id="login-form">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Title level={1}>{isPasswordReset ? "Reset Password" : "Login"}</Title>
      </div>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={isPasswordReset ? handlePasswordReset : handleSubmit}
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

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Form.Item>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button type="primary" htmlType="submit">
                {isPasswordReset ? "reset password" : "login"}
              </Button>
            </div>
          </Form.Item>
        </div>
      </Form>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {!isPasswordReset && <ResetPassword />}
      </div>
    </div>
  );
};

export default Login;
