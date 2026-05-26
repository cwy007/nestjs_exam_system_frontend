import { Navigate, type RouteObject } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword";
import Layout from "./components/Layout";
import ErrorPage from "./ErrorPage";
import ExamList from "./pages/ExamList";
import EditExam from "./pages/EditExam";
import ExamDetail from "./pages/ExamDetail";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/test-list" replace />,
      },
      {
        path: "/test-list",
        element: <ExamList />,
      },
      {
        path: "/edit-exam/:id",
        element: <EditExam />,
      },
      {
        path: "/test-detail/:id",
        element: <ExamDetail />,
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
