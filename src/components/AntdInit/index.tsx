import { App } from "antd";
import { useEffect } from "react";
import globalMessage from "../../common/utils/globalMessage";

/**
 * 在 <App> 内挂载，将 message 实例注入全局，供 axios 拦截器等非组件环境使用。
 */
function AntdInit() {
  const { message } = App.useApp();

  useEffect(() => {
    globalMessage.instance = message;
  }, [message]);

  return null;
}

export default AntdInit;
