import React from "react";
import useStateContext from "../hooks/useStateContext";
import { Navigate, Outlet } from "react-router-dom";

export default function Authenticate() {
  const { context } = useStateContext();

  return context.authToken === "" ? <Navigate to="/" /> : <Outlet />;
}
