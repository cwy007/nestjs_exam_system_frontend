import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import "./index.scss";
import { register, getCaptcha } from "./services";
import type { RegisterUserDto } from "./types";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [form] = Form.useForm<RegisterUserDto>();
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const handleSendCaptcha = async () => {
    const email = form.getFieldValue("email") as string;
    if (!email) {
      form.validateFields(["email"]);
      return;
    }
    setCaptchaLoading(true);
    try {
      const res = await getCaptcha(email);
      if (res.code === 200) {
        message.success("验证码已发送，请查收邮件");
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        message.error(res.message || "发送失败，请重试");
      }
    } catch {
      // 错误已在请求拦截器中统一提示
    } finally {
      setCaptchaLoading(false);
    }
  };

  const onFinish = async (values: RegisterUserDto) => {
    try {
      const res = await register(values);
      if (res.code === 200) {
        message.success("注册成功");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        message.error(res.message || "注册失败，请重试");
      }
    } catch {
      // 错误已在请求拦截器中统一提示
    }
  };

  return (
    <div id="signup-container">
      <h1 className="title">考试系统注册</h1>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码最少6位" },
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item
          label="确认密码"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "请确认密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请再次输入密码" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "请输入有效的邮箱地址" },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item label="验证码" required>
          <div className="captcha-row">
            <Form.Item name="captcha" noStyle rules={[{ required: true, message: "请输入验证码" }]}>
              <Input placeholder="请输入验证码" />
            </Form.Item>
            <Button
              type="primary"
              onClick={handleSendCaptcha}
              loading={captchaLoading}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `${countdown}s 后重新发送` : "发送验证码"}
            </Button>
          </div>
        </Form.Item>

        <Form.Item>
          <div className="links">
            <a href="/login">已有账号？去登录</a>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SignUp;
