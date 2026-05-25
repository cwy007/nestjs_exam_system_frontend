import { Navigate, type RouteObject } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword";
import Layout from "./components/Layout";
import ErrorPage from "./ErrorPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/signup" replace />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/update-password",
    element: <UpdatePassword />,
  },
];

export default routes;
