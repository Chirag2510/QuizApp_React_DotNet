import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Signup from "./Signup";
import { ENDPOINTS, createAPIEndpoint } from "../api";
import { ContextProvider } from "../hooks/useStateContext";

jest.mock("../api");

describe("Signup Component", () => {
  const renderComponent = () =>
    render(
      <Router>
        <ContextProvider>
          <Signup />
        </ContextProvider>
      </Router>
    );

  test("renders signup form", () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /signup/i })).toBeInTheDocument();
  });

  test("validates email, name, and password fields", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /signup/i }));

    expect(await screen.findByText(/email is not valid/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/this field is required/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 7 characters long/i)
    ).toBeInTheDocument();
  });

  test("displays error message on failed signup", async () => {
    createAPIEndpoint.mockImplementation(() => ({
      post: jest.fn().mockRejectedValue({
        response: {
          status: 409,
          data: { message: "Email is already registered." },
        },
      }),
    }));

    renderComponent();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /signup/i }));

    expect(
      await screen.findByText(/email is already registered/i)
    ).toBeInTheDocument();
  });

  test("navigates to quiz page on successful signup", async () => {
    createAPIEndpoint.mockImplementation(() => ({
      post: jest.fn().mockResolvedValue({
        data: { participantId: 1, token: "test-token" },
      }),
    }));

    renderComponent();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /signup/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/quiz");
    });
  });
});
