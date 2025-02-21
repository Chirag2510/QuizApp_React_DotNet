import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Container, Button } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import useStateContext from "../hooks/useStateContext";
import { createAPIEndpoint, ENDPOINTS } from "../api";

export default function Layout() {
  const { resetContext } = useStateContext();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const logout = () => {
    createAPIEndpoint(ENDPOINTS.logout)
      .post()
      .then(() => {
        resetContext();
        navigate("/");
      })
      .catch((err) => {
        console.error("Failed to Logout", err);
        setError(new Error("Failed to Logout"));
      });
  };

  if (error) {
    setError(null);
  }

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ width: 640, m: "auto" }}>
          <Typography variant="h4" align="center" sx={{ flexGrow: 1 }}>
            Quiz App
          </Typography>
          <Button onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Outlet />
      </Container>
    </>
  );
}
