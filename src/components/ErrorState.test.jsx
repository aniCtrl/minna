import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorState from "./ErrorState";

describe("ErrorState", () => {
  it("renders the provided error message", () => {
    render(<ErrorState message="Something went wrong." />);

    expect(
      screen.getByText("Something went wrong.")
    ).toBeInTheDocument();
  });

  it("renders the default error message", () => {
    render(<ErrorState />);

    expect(
      screen.getByText("Something went wrong.")
    ).toBeInTheDocument();
  });
});