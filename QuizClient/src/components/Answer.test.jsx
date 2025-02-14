import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Answer from "./Answer";
import { green, red } from "@mui/material/colors";

const qnAnswers = [
  {
    qnInWords: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Lisbon"],
    answer: 2,
    selected: 2,
    imageName: null,
  },
  {
    qnInWords: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    answer: 1,
    selected: 0,
    imageName: null,
  },
];

describe("Answer component", () => {
  test("renders Answer component with questions and options", () => {
    render(<Answer qnAnswers={qnAnswers} />);

    // Check if the questions are rendered
    expect(
      screen.getByText(/What is the capital of France?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Which planet is known as the Red Planet?/i)
    ).toBeInTheDocument();

    // Check if the options are rendered
    expect(screen.getByText(/Berlin/i)).toBeInTheDocument();
    expect(screen.getByText(/Madrid/i)).toBeInTheDocument();
    expect(screen.getByText(/Paris/i)).toBeInTheDocument();
    expect(screen.getByText(/Lisbon/i)).toBeInTheDocument();
    expect(screen.getByText(/Earth/i)).toBeInTheDocument();
    expect(screen.getByText(/Mars/i)).toBeInTheDocument();
    expect(screen.getByText(/Jupiter/i)).toBeInTheDocument();
    expect(screen.getByText(/Saturn/i)).toBeInTheDocument();
  });

  test("expands and collapses the accordion panels", () => {
    render(<Answer qnAnswers={qnAnswers} />);

    // Check if the first question's panel is collapsed initially
    expect(screen.queryByText(/Berlin/i)).not.toBeVisible();

    // Expand the first question's panel
    fireEvent.click(screen.getByText(/What is the capital of France?/i));
    expect(screen.queryByText(/Berlin/i)).toBeVisible();
  });

  test("marks the correct and incorrect answers with appropriate colors", () => {
    render(<Answer qnAnswers={qnAnswers} />);

    // Expand the panels to make the options visible
    fireEvent.click(screen.getByText(/What is the capital of France?/i));
    fireEvent.click(
      screen.getByText(/Which planet is known as the Red Planet?/i)
    );

    // Check the color of the correct and incorrect answers
    expect(screen.getByText(/Paris/i)).toHaveStyle(`color: ${green[500]}`);
    expect(screen.getByText(/Mars/i)).toHaveStyle(`color: ${green[500]}`);
    expect(screen.getByText(/Earth/i)).toHaveStyle(`color: ${red[500]}`);
  });
});
