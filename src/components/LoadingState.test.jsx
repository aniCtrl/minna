import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingState from "./LoadingState";

describe("LoadingState", () => {
  it("renders the provided loading message", () => {
    render(<LoadingState message="Loading results..." />);

    expect(
      screen.getByText("Loading results...")
    ).toBeInTheDocument();
  });

  it("renders the default loading message", () => {
    render(<LoadingState />);

    expect(
      screen.getByText("Loading...")
    ).toBeInTheDocument();
  });
});