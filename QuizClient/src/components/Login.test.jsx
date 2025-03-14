import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Login from "./Login";
import { ENDPOINTS, createAPIEndpoint } from "../api";
import { ContextProvider } from "../hooks/useStateContext";

jest.mock("../api");

describe("Login Component", () => {
  const renderComponent = () =>
    render(
      <Router>
        <ContextProvider>
          <Login />
        </ContextProvider>
      </Router>
    );

  test("renders login form", () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("validates email and password fields", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/email is not valid/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/this field is required/i)
    ).toBeInTheDocument();
  });

  test("displays error message on failed login", async () => {
    createAPIEndpoint.mockImplementation(() => ({
      post: jest.fn().mockRejectedValue({
        response: {
          status: 401,
          data: { message: "Invalid email or password." },
        },
      }),
    }));

    renderComponent();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
  });

  test("navigates to quiz page on successful login", async () => {
    createAPIEndpoint.mockImplementation(() => ({
      post: jest.fn().mockResolvedValue({
        data: { participantId: 1, token: "test-token" },
      }),
    }));

    renderComponent();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/quiz");
    });
  });
});
