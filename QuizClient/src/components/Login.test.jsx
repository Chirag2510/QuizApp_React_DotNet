import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";
import { ContextProvider } from "../hooks/useStateContext";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const renderWithProviders = (ui) => {
  return render(
    <ContextProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </ContextProvider>
  );
};

const mock = new MockAdapter(axios);

describe("Login component", () => {
  test("renders Login component", () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/Quiz App/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start/i })).toBeInTheDocument();
  });

  test("validates form inputs", () => {
    renderWithProviders(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Start/i }));

    expect(screen.getByText(/Email is not valid/i)).toBeInTheDocument();
    expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
  });

  test("submits form with valid inputs", async () => {
    mock.onPost("http://localhost:5220/api/Participants/").reply(200, {
      participantId: 1,
    });

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "Test User" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Start/i }));

    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].data).toEqual(
        JSON.stringify({ name: "Test User", email: "test@example.com" })
      );
      expect(window.location.pathname).toBe("/quiz");
    });
  });
});
