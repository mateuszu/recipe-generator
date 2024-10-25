import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../src/App";
import axios from "axios";
import "@testing-library/jest-dom";

jest.mock("axios");

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("App Component", () => {
  it("renders the header and search form correctly", () => {
    renderWithClient(<App />);
    expect(screen.getByText(/Recipe Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/Customize your search/i)).toBeInTheDocument();
  });

  it("fetches and displays ingredients on load", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { meals: [{ idIngredient: "1", strIngredient: "Chicken" }] },
    });

    renderWithClient(<App />);

    await waitFor(() =>
      expect(screen.queryByText(/Loading ingredients/i)).not.toBeInTheDocument()
    );

    await waitFor(() =>
      expect(screen.getByText("Chicken")).toBeInTheDocument()
    );
  });

  it("shows scroll to top button when scrolled down", () => {
    renderWithClient(<App />);
    fireEvent.scroll(window, { target: { scrollY: 400 } });
    expect(
      screen.getByRole("button", { name: /Scroll to Top/i })
    ).toBeInTheDocument();
  });
});
