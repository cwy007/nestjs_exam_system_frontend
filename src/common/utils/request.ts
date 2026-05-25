import axios from "axios";
import globalMessage from "./globalMessage";

const BASE_URL = "http://localhost:3001";

/** 全局 axios 实例，所有业务请求均通过此实例发出 */
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/** 清除本地登录状态并跳转到登录页 */
function forceLogout() {
  globalMessage.instance?.error("登录状态已过期，请重新登录");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
}

/** 是否已有刷新请求正在进行中 */
let isRefreshing = false;
/** 等待刷新结果的回调队列，刷新完成后统一通知 */
let pendingRequests: Array<(token: string | null) => void> = [];

/** 刷新完成后，将新 token 分发给所有排队的请求 */
function notifyPending(token: string | null) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

/**
 * 调用 GET /user/refresh 换取新的 accessToken 和 refreshToken。
 * 成功后写入 localStorage 并返回新的 accessToken；失败返回 null。
 */
async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await axios.get<never, { data: { accessToken: string; refreshToken: string } }>(
      `${BASE_URL}/user/refresh`,
      { params: { refreshToken } }
    );
    const { accessToken, refreshToken: newRefreshToken } = res.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
}

/**
 * 保证同一时刻只发起一次刷新请求。
 * - 若刷新已在进行中，当前调用者进入等待队列，待刷新完成后一并返回结果。
 * - 若刷新未开始，由当前调用者发起刷新，完成后通知所有等待者。
 */
async function refreshOnce(): Promise<string | null> {
  if (isRefreshing) {
    // 已有刷新进行中，将自身加入等待队列
    return new Promise<string | null>((resolve) => {
      pendingRequests.push(resolve);
    });
  }

  isRefreshing = true;
  const token = await tryRefreshToken();
  isRefreshing = false;
  notifyPending(token); // 通知所有排队请求
  return token;
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
  async (response) => {
    // 业务层 401（code 字段）：token 过期，尝试刷新后重试原请求
    if (response.data?.code === 401) {
      const token = await refreshOnce();
      if (token) {
        const config = response.config;
        config.headers.Authorization = `Bearer ${token}`;
        return axios(config).then((r) => r.data);
      }
      forceLogout();
      return Promise.reject("未授权");
    }

    return response.data;
  },
  async (error) => {
    // HTTP 层 401：同样尝试刷新后重试，刷新失败则强制登出
    if (error.response?.status === 401) {
      const token = await refreshOnce();
      if (token) {
        const config = error.config;
        config.headers.Authorization = `Bearer ${token}`;
        return axios(config).then((r) => r.data);
      }
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
