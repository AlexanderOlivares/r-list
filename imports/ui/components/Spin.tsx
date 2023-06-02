import { Space, Spin } from "antd";
import React from "react";

const App: React.FC = () => (
  <Space align='center' size="large" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
    <Spin size="large" />
  </Space>
);

export default App;