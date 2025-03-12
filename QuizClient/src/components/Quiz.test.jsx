import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Quiz from "./Quiz";
import { ENDPOINTS, createAPIEndpoint } from "../api";
import { ContextProvider } from "../hooks/useStateContext";

jest.mock("../api");

const mockQuestions = [
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
    options: ["Option A", "Option B", "Option C", "Option D"],
  },
  {
    qnId: 3,
    qnInWords: "Test Qn 3",
    imageName: null,
    options: ["Option X", "Option Y", "Option Z", "Option W"],
  },
];

describe("Quiz Component", () => {
  beforeEach(() => {
    createAPIEndpoint.mockImplementation(() => ({
      fetch: jest.fn().mockResolvedValue({
        data: mockQuestions,
      }),
    }));
  });

  const renderComponent = () =>
    render(
      <Router>
        <ContextProvider>
          <Quiz />
        </ContextProvider>
      </Router>
    );

  test("fetches and displays questions", async () => {
    renderComponent();
    expect(await screen.findByText(/Test Qn 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();
  });

  test("navigates between questions using Next and Previous buttons", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Test Qn 1/i)).toBeInTheDocument();
    });

    // Next button should be enabled, Previous button should be disabled initially
    const nextButton = screen.getByText("Next");
    const previousButton = screen.getByText("Previous");
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    // Click Next
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText(/Test Qn 2/i)).toBeInTheDocument();
    });

    // Both buttons should be enabled on second question
    expect(previousButton).toBeEnabled();
    expect(nextButton).toBeEnabled();

    // Click Previous
    fireEvent.click(previousButton);
    await waitFor(() => {
      expect(screen.getByText(/Test Qn 1/i)).toBeInTheDocument();
    });
  });

  test("shows prompt when trying to finish with unanswered questions", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Test Qn 1/i)).toBeInTheDocument();
    });

    // Navigate to last question without answering any
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));

    // Try to finish
    fireEvent.click(screen.getByText("Finish"));

    // Check if prompt appears
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Unanswered Questions/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Please answer all questions before submitting/i)
    ).toBeInTheDocument();

    // Check if all unanswered questions are listed in the dialog
    const dialog = screen.getByRole("dialog");
    const questionButtons = within(dialog).getAllByRole("button");
    expect(questionButtons).toHaveLength(4); // 3 question buttons + 1 close button
    expect(questionButtons[0]).toHaveTextContent("Question 1");
    expect(questionButtons[1]).toHaveTextContent("Question 2");
    expect(questionButtons[2]).toHaveTextContent("Question 3");
  });

  test("navigates to result page when all questions are answered", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Test Qn 1/i)).toBeInTheDocument();
    });

    // Answer all questions
    fireEvent.click(screen.getByText(/Option 1/i));
    fireEvent.click(screen.getByText("Next"));

    fireEvent.click(screen.getByText(/Option A/i));
    fireEvent.click(screen.getByText("Next"));

    fireEvent.click(screen.getByText(/Option X/i));
    fireEvent.click(screen.getByText("Finish"));

    // Should navigate to result page
    await waitFor(() => {
      expect(window.location.pathname).toBe("/result");
    });
  });

  test("allows navigation to specific unanswered question from prompt", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Test Qn 1/i)).toBeInTheDocument();
    });

    // Skip to last question without answering
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Finish"));

    // Click on "Question 1" in the prompt
    fireEvent.click(screen.getByRole("button", { name: /Question 1/i }));

    // Should navigate back to first question
    expect(screen.getByText(/Test Qn 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();
  });
});
