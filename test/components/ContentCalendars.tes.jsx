import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ContentCalendars from "../../src/pages/Clients/ContentCalendars";
import { useGetClientCalendarsQuery, useCreateClientCalendarMutation } from "../../src/services/api/clientApiSlice";
import useCurrentUser from "../../src/hooks/useCurrentUser";
import { store } from "../../src/store/store";

// ✅ Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useParams: () => ({ clientId: "123" }), // Mock useParams
        MemoryRouter: actual.MemoryRouter, // Ensure MemoryRouter is returned
        Route: actual.Route,
        Routes: actual.Routes,
        Link: actual.Link,
    };
});


// ✅ Mock useCurrentUser
vi.mock("../../src/hooks/useCurrentUser", () => ({
    default: vi.fn(),
}));

// ✅ Mock API Hooks
vi.mock("../../src/services/api/clientApiSlice", () => ({
    useGetClientCalendarsQuery: vi.fn(),
    useCreateClientCalendarMutation: vi.fn(),
}));

// ✅ Utility function to render component with Redux Provider & Router
const renderWithProviders = (ui, { route = "/clients/123/content-calendars" } = {}) => {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/clients/:clientId/content-calendars" element={ui} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

// ✅ TEST SUITE
describe("ContentCalendars Component", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        useCurrentUser.mockReturnValue({ role: "marketing_manager" });
        useGetClientCalendarsQuery.mockReturnValue({ data: [], isLoading: false });
        useCreateClientCalendarMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    });

    // ✅ 1️⃣ Test: Displays loading state
    it("shows a loading message when fetching calendars", () => {
        useGetClientCalendarsQuery.mockReturnValue({ data: null, isLoading: true });

        renderWithProviders(<ContentCalendars />);

        expect(screen.getByText("Loading calendars...")).toBeInTheDocument();
    });

    // ✅ 2️⃣ Test: Displays empty state when no calendars are available
    it("shows a message when no content calendars are available", () => {
        useGetClientCalendarsQuery.mockReturnValue({ data: [], isLoading: false });

        renderWithProviders(<ContentCalendars />);

        expect(screen.getByText("No content calendars available at the moment.")).toBeInTheDocument();
    });

    // ✅ 3️⃣ Test: Displays a list of content calendars when available
    it("renders a list of calendars correctly", async () => {
        const mockCalendars = [
            { calendar_id: 1, month_name: "January 2024", client_business_name: "Test Business", account_manager_username: "test_manager" },
            { calendar_id: 2, month_name: "February 2024", client_business_name: "Another Business", account_manager_username: "another_manager" },
        ];

        useGetClientCalendarsQuery.mockReturnValue({ data: mockCalendars, isLoading: false });

        renderWithProviders(<ContentCalendars />);

        expect(screen.getByText("January 2024")).toBeInTheDocument();
        expect(screen.getByText("February 2024")).toBeInTheDocument();
    });

    // ✅ 4️⃣ Test: Marketing manager sees the "Add Calendar" button
    it("displays the 'Add Calendar' button for a marketing manager", () => {
        renderWithProviders(<ContentCalendars />);

        expect(screen.getByRole("button", { name: /Add Calendar/i })).toBeInTheDocument();
    });

    // ✅ 5️⃣ Test: Opening and closing the modal
    it("allows marketing manager to open and close the modal", async () => {
        renderWithProviders(<ContentCalendars />);

        fireEvent.click(screen.getByRole("button", { name: /Add Calendar/i }));
        expect(await screen.findByText("Create Content Calendar")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /×/i }));
        await waitFor(() => expect(screen.queryByText("Create Content Calendar")).not.toBeInTheDocument());
    });

    // ✅ 6️⃣ Test: Prevents calendar creation if input is empty
    it("shows an alert if the input field is empty", async () => {
        global.alert = vi.fn();
        renderWithProviders(<ContentCalendars />);

        fireEvent.click(screen.getByRole("button", { name: /Add Calendar/i }));
        await screen.findByText("Create Content Calendar");

        fireEvent.click(screen.getByRole("button", { name: /Create Calendar/i }));

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith("Please enter Month & Year");
        });
    });

    // ✅ 7️⃣ Test: Creates a new calendar successfully
    it("calls API to create a new calendar", async () => {
        const mockCreateCalendar = vi.fn(() => Promise.resolve({}));
        useCreateClientCalendarMutation.mockReturnValue([mockCreateCalendar, { isLoading: false }]);

        renderWithProviders(<ContentCalendars />);

        fireEvent.click(screen.getByRole("button", { name: /Add Calendar/i }));
        await screen.findByText("Create Content Calendar");

        fireEvent.change(screen.getByPlaceholderText("Enter Month & Year"), { target: { value: "March 2024" } });

        fireEvent.click(screen.getByRole("button", { name: /Create Calendar/i }));

        await waitFor(() => {
            expect(mockCreateCalendar).toHaveBeenCalledWith({
                clientId: "123",
                calendarData: { month_name: "March 2024" },
            });
        });
    });

    // ✅ 8️⃣ Test: Renders view and delete buttons
    it("renders view and delete buttons correctly", () => {
        const mockCalendars = [
            { calendar_id: 1, month_name: "January 2024", client_business_name: "Test Business", account_manager_username: "test_manager" },
        ];

        useGetClientCalendarsQuery.mockReturnValue({ data: mockCalendars, isLoading: false });

        renderWithProviders(<ContentCalendars />);

        expect(screen.getByRole("link", { name: /View/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
    });
});
