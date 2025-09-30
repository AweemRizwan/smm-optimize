import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CalendarMonthlyView from "../../src/pages/Clients/CalendarMonthlyView";
import { useFetchClientCalendarQuery } from "../../src/services/api/calendarMonthlyViewApiSlice";
import { store } from "../../src/store/store";

// Mock `useFetchClientCalendarQuery`
vi.mock("../../src/services/api/calendarMonthlyViewApiSlice", () => ({
  useFetchClientCalendarQuery: vi.fn(),
}));

// ✅ Utility function to wrap components with Router & Redux Provider
const renderWithProviders = (ui, { route = "/business/account/2024-02" } = {}) => {
  window.history.pushState({}, "Test Page", route);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/:businessName/:accountManagerName/:yearMonth" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

// ✅ TEST SUITE
describe("CalendarMonthlyView Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ✅ 1️⃣ Test: Displays loading state
  it("renders loading state when data is being fetched", () => {
    useFetchClientCalendarQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<CalendarMonthlyView />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  // ✅ 2️⃣ Test: Displays error message on API failure
  it("renders error message when API request fails", async () => {
    useFetchClientCalendarQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: "Failed to fetch" },
    });

    renderWithProviders(<CalendarMonthlyView />);

    await waitFor(() => {
      expect(screen.getByText("Error: Failed to fetch")).toBeInTheDocument();
    });
  });

  // ✅ 3️⃣ Test: Displays posts correctly
  it("renders calendar posts correctly", async () => {
    const mockPosts = [
      {
        id: 1,
        tagline: "Exciting Launch!",
        date: "2024-02-10",
        category: "Marketing",
        type: "Social Media",
        cta: "Sign Up Now",
        caption: "Join us for an amazing event!",
        hashtags: "#Marketing #Event",
        creatives: "https://example.com/image1.jpg",
        creativesType: "image",
        client_approval: true,
        comments: "Looks good!",
      },
      {
        id: 2,
        tagline: "New Product!",
        date: "2024-02-15",
        category: "Sales",
        type: "Advertisement",
        cta: "Buy Now",
        caption: "Get the best deal today!",
        hashtags: "#Sales #Offer",
        creatives: "https://example.com/image2.jpg",
        creativesType: "image",
        client_approval: false,
        comments: "Needs some revision.",
      },
    ];

    useFetchClientCalendarQuery.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<CalendarMonthlyView />);

    // Wait for posts to render
    await waitFor(() => {
      expect(screen.getByText("Exciting Launch!")).toBeInTheDocument();
      expect(screen.getByText("New Product!")).toBeInTheDocument();
    });

    // Verify details for the first post
    expect(screen.getByText("Exciting Launch!")).toBeInTheDocument();
    expect(screen.getByText("2024-02-10")).toBeInTheDocument();
    expect(screen.getByText("Marketing")).toBeInTheDocument();
    expect(screen.getByText("Social Media")).toBeInTheDocument();
    expect(screen.getByText("Sign Up Now")).toBeInTheDocument();
    expect(screen.getByText("Join us for an amazing event!")).toBeInTheDocument();
    expect(screen.getByText("#Marketing #Event")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Looks good!")).toBeInTheDocument();

    // Verify details for the second post
    expect(screen.getByText("New Product!")).toBeInTheDocument();
    expect(screen.getByText("2024-02-15")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Advertisement")).toBeInTheDocument();
    expect(screen.getByText("Buy Now")).toBeInTheDocument();
    expect(screen.getByText("Get the best deal today!")).toBeInTheDocument();
    expect(screen.getByText("#Sales #Offer")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Needs some revision.")).toBeInTheDocument();
  });

  // ✅ 4️⃣ Test: Ensures alternating row styles (`isEven` logic)
  it("applies alternating row styles correctly", async () => {
    const mockPosts = [
      {
        id: 1,
        tagline: "First Post",
        date: "2024-02-10",
        category: "Marketing",
        type: "Social Media",
        cta: "Sign Up Now",
        caption: "Join us for an amazing event!",
        hashtags: "#Marketing #Event",
        creatives: "https://example.com/image1.jpg",
        creativesType: "image",
        client_approval: true,
        comments: "Looks good!",
      },
      {
        id: 2,
        tagline: "Second Post",
        date: "2024-02-15",
        category: "Sales",
        type: "Advertisement",
        cta: "Buy Now",
        caption: "Get the best deal today!",
        hashtags: "#Sales #Offer",
        creatives: "https://example.com/image2.jpg",
        creativesType: "image",
        client_approval: false,
        comments: "Needs some revision.",
      },
    ];

    useFetchClientCalendarQuery.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<CalendarMonthlyView />);

    await waitFor(() => {
      const postCards = screen.getAllByRole("article"); // Assuming `PostCard` uses a semantic HTML role like `article`
      expect(postCards[0]).toHaveClass("flex-row-reverse"); // First post should have default flex-row
      expect(postCards[1]).toHaveClass("flex-row"); // Second post should have reversed flex direction
    });
  });
});
