import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes.tsx";
import { App, ConfigProvider } from "antd";
import AntdInit from "./components/AntdInit/index.tsx";
import zhCn from "antd/locale/zh_CN";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <ConfigProvider locale={zhCn}>
    <App>
      <AntdInit />
      <RouterProvider router={router} />
    </App>
  </ConfigProvider>,
);
