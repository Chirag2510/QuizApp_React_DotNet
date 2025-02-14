import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Quiz from "./Quiz";
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

describe("Quiz component", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("renders Quiz component", async () => {
    mock.onGet("http://localhost:5220/api/Questions/").reply(200, [
      {
        qnId: 1,
        qnInWords: "Test Qn 1",
        imageName: null,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
        qnId: 2,
        qnInWords: "Test Qn 1",
        imageName: null,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
    ]);

    renderWithProviders(<Quiz />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    });
  });

  test("updates answer and navigates to result", async () => {
    mock.onGet("http://localhost:5220/api/Questions/").reply(200, [
      {
        qnId: 1,
        qnInWords: "Test Qn 1",
        imageName: null,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
        qnId: 2,
        qnInWords: "Test Qn 2",
        imageName: null,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
        qnId: 3,
        qnInWords: "Test Qn 3",
        imageName: null,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
        qnId: 4,
        qnInWords: "Test Qn 4",
        imageName: null,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
        qnId: 5,
        qnInWords: "Test Qn 5",
        imageName: null,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
    ]);

    renderWithProviders(<Quiz />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(screen.getByText(/Question 2/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(screen.getByText(/Question 3/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(screen.getByText(/Question 4/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(screen.getByText(/Question 5/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/result");
    });
  });
});
