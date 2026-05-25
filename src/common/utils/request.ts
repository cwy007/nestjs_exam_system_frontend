import axios, { type AxiosResponse } from "axios";
import globalMessage from "./globalMessage";

/**
 * 走相对路径，由 Vite dev server 的 proxy 转发到对应后端：
 * - /user/*  -> http://localhost:3001
 * - /exam/*  -> http://localhost:3002
 * 见 vite.config.ts
 */
const BASE_URL = "";

/** 全局 axios 实例，所有业务请求均通过此实例发出 */
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/** 清除本地登录状态并跳转到登录页 */
function forceLogout() {
  globalMessage.instance?.error("登录状态已过期，请重新登录");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userInfo");
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
}

/**
 * 单 token 续期：后端在每次响应头里下发新的 token，
 * 前端将其覆盖写入 localStorage，实现无感刷新。
 */
function saveTokenFromResponse(response: AxiosResponse) {
  const newToken = response.headers?.token as string | undefined;
  if (newToken) {
    localStorage.setItem("accessToken", newToken);
  }
}

/** 请求拦截器：自动在 Authorization 头中携带 accessToken */
request.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    // 单 token 续期：读取响应头中的新 token 并保存
    saveTokenFromResponse(response);

    // 业务层 401：无法续期，强制登出
    if (response.data?.code === 401) {
      forceLogout();
      return Promise.reject("未授权");
    }

    return response.data;
  },
  (error) => {
    // HTTP 层 401：强制登出
    if (error.response?.status === 401) {
      forceLogout();
      return Promise.reject("未授权");
    }

    // 其他错误：提取后端返回的错误信息并通过全局消息提示
    const errMsg: string =
      error.response?.data?.data ??
      error.response?.data?.message ??
      error.message ??
      "请求失败，请重试";
    globalMessage.instance?.error(errMsg);
    return Promise.reject(errMsg);
  }
);

export default request;
