import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Result from "./Result";
import { BrowserRouter } from "react-router-dom";
import useStateContext from "../hooks/useStateContext";
import { createAPIEndpoint, ENDPOINTS } from "../api";

jest.mock("../hooks/useStateContext");
jest.mock("../api");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockContext = {
  selectedOptions: [
    { qnId: 1, selected: "a" },
    { qnId: 2, selected: "a" },
    { qnId: 3, selected: "c" },
  ],
  participantId: 1,
  timeTaken: 120,
};

describe("Result Component", () => {
  beforeEach(() => {
    useStateContext.mockReturnValue({
      context: mockContext,
      setContext: jest.fn(),
    });

    createAPIEndpoint.mockImplementation((endpoint) => {
      if (endpoint === ENDPOINTS.answer) {
        return {
          post: jest.fn().mockResolvedValue({
            data: [
              { qnId: 1, answer: "a", options: ["a", "b", "c", "d"] },
              { qnId: 2, answer: "b", options: ["a", "b", "c", "d"] },
              { qnId: 3, answer: "c", options: ["a", "b", "c", "d"] },
            ],
          }),
        };
      }
      if (endpoint === ENDPOINTS.participant) {
        return {
          put: jest.fn().mockResolvedValue({}),
        };
      }
    });
  });

  test("renders without crashing", async () => {
    render(
      <BrowserRouter>
        <Result />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
      expect(screen.getByText(/YOUR SCORE/i)).toBeInTheDocument();
    });
  });

  test("displays score correctly", async () => {
    render(
      <BrowserRouter>
        <Result />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return element.tagName.toLowerCase() === "span" && /2/.test(content);
        })
      ).toBeInTheDocument();
    });
  });

  test("displays formatted time correctly", async () => {
    render(
      <BrowserRouter>
        <Result />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Took 02:00 mins/i)).toBeInTheDocument();
    });
  });

  test("submit score button works correctly", async () => {
    render(
      <BrowserRouter>
        <Result />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(screen.getByText(/Score Updated./i)).toBeVisible();
    });
  });

  test("restart button works correctly", async () => {
    render(
      <BrowserRouter>
        <Result />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Re-try/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/quiz");
    });
  });
});
