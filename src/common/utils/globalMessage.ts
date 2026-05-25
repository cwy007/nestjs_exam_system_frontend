import type { MessageInstance } from "antd/es/message/interface";

/**
 * 存储 antd message 实例，供非组件环境（如 axios 拦截器）调用。
 * 需在 <App> 组件内通过 AntdInit 完成初始化。
 */
const globalMessage: { instance: MessageInstance | null } = {
  instance: null,
};

export default globalMessage;
