import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import Protected from "./features/auth/components/Protected.jsx";
import LoggedIn from "./features/auth/components/LoggedIn.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Interview from "./features/interview/pages/Interview.jsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <LoggedIn>
        <Login />
      </LoggedIn>
    ),
  },
  {
    path: "/register",
    element: (
      <LoggedIn>
        <Register />
      </LoggedIn>
    ),
  },
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/interview/:interviewId",
    element: (
      <Protected>
        <Interview />
      </Protected>
    ),
  },
]);
