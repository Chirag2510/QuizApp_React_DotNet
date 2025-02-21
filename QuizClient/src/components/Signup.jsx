import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Link,
} from "@mui/material";
import { Box } from "@mui/system";
import Center from "./Center";
import useForm from "../hooks/useForm";
import { ENDPOINTS, createAPIEndpoint } from "../api";
import { useNavigate } from "react-router-dom";
import useStateContext from "../hooks/useStateContext";

const getFreshModel = () => ({
  name: "",
  email: "",
  password: "",
});

export default function Signup() {
  const navigate = useNavigate();
  const { setContext } = useStateContext();
  const [error, setError] = useState(null);

  const { values, setValues, errors, setErrors, handleInputChange } =
    useForm(getFreshModel);

  const signup = (e) => {
    e.preventDefault();
    if (validate()) {
      createAPIEndpoint(ENDPOINTS.signup)
        .post(values)
        .then((res) => {
          setContext({
            participantId: res.data.participantId,
            authToken: res.data.token,
          });
          navigate("/quiz");
        })
        .catch((err) => {
          if (err.response && err.response.status === 409) {
            setError(new Error(err.response.data.message));
          } else {
            console.error("Failed to Signup", err);
            setError(new Error("Failed to Signup"));
          }
        });
    }
  };

  const validate = () => {
    let temp = {};
    temp.email = /\S+@\S+\.\S+/.test(values.email) ? "" : "Email is not valid.";
    temp.name = values.name !== "" ? "" : "This field is required.";
    temp.password =
      values.password.length > 6
        ? ""
        : "Password must be at least 7 characters long.";
    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Center>
      <Card sx={{ width: 400 }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ my: 3 }}>
            Quiz App
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}
          <Box
            sx={{
              "& .MuiTextField-root": {
                m: 1,
                width: "90%",
              },
            }}
          >
            <form noValidate autoComplete="on" onSubmit={signup}>
              <TextField
                label="Email"
                name="email"
                value={values.email}
                onChange={handleInputChange}
                variant="outlined"
                {...(errors.email && { error: true, helperText: errors.email })}
              />
              <TextField
                label="Name"
                name="name"
                value={values.name}
                onChange={handleInputChange}
                variant="outlined"
                {...(errors.name && { error: true, helperText: errors.name })}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleInputChange}
                variant="outlined"
                {...(errors.password && {
                  error: true,
                  helperText: errors.password,
                })}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ width: "90%" }}
              >
                Signup
              </Button>
            </form>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <Link href="/" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Center>
  );
}
