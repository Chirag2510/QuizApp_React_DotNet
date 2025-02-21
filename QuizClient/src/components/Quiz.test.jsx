import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Quiz from "./Quiz";
import { ENDPOINTS, createAPIEndpoint } from "../api";
import { ContextProvider } from "../hooks/useStateContext";

jest.mock("../api");

describe("Quiz Component", () => {
  const renderComponent = () =>
    render(
      <Router>
        <ContextProvider>
          <Quiz />
        </ContextProvider>
      </Router>
    );

  test("fetches and displays questions", async () => {
    createAPIEndpoint.mockImplementation(() => ({
      fetch: jest.fn().mockResolvedValue({
        data: [
          {
            questionId: 1,
            qnInWords: "Test Qn 1",
            imageName: null,
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          },
          {
            questionId: 2,
            qnInWords: "Test Qn 2",
            imageName: null,
            options: ["Option A", "Option B", "Option C", "Option D"],
          },
        ],
      }),
    }));

    renderComponent();
    expect(await screen.findByText(/Test Qn 1/i)).toBeInTheDocument();
  });

  test("selects an option and submits the answer", async () => {
    createAPIEndpoint.mockImplementation(() => ({
      fetch: jest.fn().mockResolvedValue({
        data: [
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
        ],
      }),
      post: jest.fn().mockResolvedValue({}),
    }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Test Qn 1/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(screen.getByText(/Test Qn 2/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(screen.getByText(/Test Qn 3/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(screen.getByText(/Test Qn 4/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(screen.getByText(/Test Qn 5/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Option 1/i));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/result");
    });
  });
});
