import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Dropdown, Avatar, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useEffect } from "react";
import cookies from "js-cookie";

const { Header, Content, Sider } = Layout;

const sideMenuItems: MenuProps["items"] = [
  { key: "/meeting-room", label: "会议室管理" },
  { key: "/booking-list", label: "预订历史" },
];

function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = cookies.get("userInfo");
    const accessToken = cookies.get("accessToken");
    const refreshToken = cookies.get("refreshToken");
    console.log("Cookies on MeetingRoomList mount:", { userInfo, accessToken, refreshToken });

    if (userInfo && accessToken && refreshToken) {
      localStorage.setItem("userInfo", userInfo);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      cookies.remove("userInfo");
      cookies.remove("accessToken");
      cookies.remove("refreshToken");
    }
  }, []);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "个人中心",
      onClick: () => navigate("/profile"),
    },
    {
      key: "update-password",
      label: "修改密码",
      onClick: () => navigate("/update-password"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "退出登录",
      danger: true,
      onClick: () => {
        localStorage.clear();
        navigate("/login");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 24px",
        }}
      >
        <span
          style={{ fontSize: 18, fontWeight: 600, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          考试系统
        </span>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />
        </Dropdown>
      </Header>

      <Layout>
        <Sider width={200} style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={["meeting-room"]}
            style={{ height: "100%", borderRight: 0 }}
            items={sideMenuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
