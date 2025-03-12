import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import NotFound from "./NotFound";

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("NotFound Component", () => {
  beforeEach(() => {
    // Clear mock calls between tests
    mockedNavigate.mockClear();
  });

  const renderComponent = () =>
    render(
      <Router>
        <NotFound />
      </Router>
    );

  test("renders 404 page with all elements", () => {
    renderComponent();

    // Check if all main elements are present
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The page you are looking for does not exist or has been moved."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });

  test("navigates to home page when clicking the Back to Home button", () => {
    renderComponent();

    // Click the Back to Home button
    const homeButton = screen.getByText("Back to Home");
    fireEvent.click(homeButton);

    // Check if navigation was called with correct path
    expect(mockedNavigate).toHaveBeenCalledWith("/");
    expect(mockedNavigate).toHaveBeenCalledTimes(1);
  });
});
