import { Form, Input, Button, message } from "antd";
import "./index.scss";
import { login } from "./services";
import type { LoginUserDto } from "./types";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form] = Form.useForm<LoginUserDto>();
  const navigate = useNavigate();

  const onFinish = async (values: LoginUserDto) => {
    try {
      const res = await login(values);
      if (res.code === 200) {
        message.success("登录成功");
        console.log("login response:", res);
        localStorage.setItem("accessToken", res.data?.token);
        localStorage.setItem("userInfo", JSON.stringify(res.data?.user));

        setTimeout(() => {
          navigate("/"); // 登录成功后跳转到主页
        }, 1500);
      } else {
        message.error(res.message || "登录失败，请重试");
      }
    } catch {
      // 错误已在请求拦截器中统一提示
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/user/google"; // 直接跳转到后端的 Google 登录接口
  };

  return (
    <div id="login-container">
      <h1 className="title">考试系统登录</h1>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="用户名/邮箱"
          name="username"
          rules={[{ required: true, message: "请输入用户名或邮箱" }]}
        >
          <Input placeholder="请输入用户名或邮箱" />
        </Form.Item>

        <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item>
          <div className="links">
            <a href="/signup">创建账号</a>
            <a href="/update-password">忘记密码</a>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form.Item>
      </Form>
      {/* Add your login form here */}

      {/* google login button */}
      <Button type="default" block onClick={handleGoogleLogin}>
        使用 Google 登录
      </Button>
    </div>
  );
}

export default Login;
