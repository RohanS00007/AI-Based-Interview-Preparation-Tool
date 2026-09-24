import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import Loader from "../../loader";
import React from "react";

const LoggedIn = ({ children }) => {
  const { loading, user } = useAuth();
  if (loading) {
    return <Loader />;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default LoggedIn;
