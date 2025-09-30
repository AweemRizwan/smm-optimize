import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import Strategy from "../../src/pages/Clients/Strategy";
import {
    useGetStrategiesQuery,
    useCreateOrUpdateStrategyMutation,
    useDeleteStrategyMutation,
} from "../../src/services/api/strategyApiSlice";
import { store } from "../../src/store/store";
import useCurrentUser from "../../src/hooks/useCurrentUser";
import { useParams } from "react-router-dom";

// ✅ Mock API Hooks
vi.mock("../../src/services/api/strategyApiSlice", () => ({
    useGetStrategiesQuery: vi.fn(),
    useCreateOrUpdateStrategyMutation: vi.fn(),
    useDeleteStrategyMutation: vi.fn(),
}));

vi.mock("../../src/hooks/useCurrentUser", () => ({
    default: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => { 
    const actual = await importOriginal();
    return {
        ...actual,
        useParams: () => ({ clientId: "123" }),
        MemoryRouter: actual.MemoryRouter,
        Route: actual.Route,
        Routes: actual.Routes,
    };
});

vi.mock("react-quill", () => ({
    __esModule: true,
    default: ({ value, onChange }) => (
        <textarea data-testid="editor" value={value} onChange={(e) => onChange(e.target.value)} />
    ),
}));

const renderWithProviders = (ui, { route = "/clients/123/strategy" } = {}) => {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/clients/:clientId/strategy" element={ui} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

describe("Strategy Component", () => {
    let mockCreateOrUpdateStrategy, mockDeleteStrategy;

    beforeEach(() => {
        vi.resetAllMocks();

        useCurrentUser.mockReturnValue({ role: "marketing_manager" });

        useGetStrategiesQuery.mockReturnValue({
            data: { strategies: { "Test Strategy": "<p>Test Content</p>" } },
            isLoading: false,
        });

        mockCreateOrUpdateStrategy = vi.fn(() => Promise.resolve({}));
        useCreateOrUpdateStrategyMutation.mockReturnValue([mockCreateOrUpdateStrategy, { isLoading: false }]);

        mockDeleteStrategy = vi.fn(() => Promise.resolve({}));
        useDeleteStrategyMutation.mockReturnValue([mockDeleteStrategy, { isLoading: false }]);
    });

    // ✅ 1️⃣ Test: Displays loading state
    it("shows a loading message when fetching strategies", () => {
        useGetStrategiesQuery.mockReturnValue({ data: null, isLoading: true });

        renderWithProviders(<Strategy />);

        expect(screen.getByText("Loading strategies...")).toBeInTheDocument();
    });

    // ✅ 2️⃣ Test: Displays fetched strategies
    it("renders strategies correctly", async () => {
        renderWithProviders(<Strategy />);

        expect(screen.getByText("Test Strategy")).toBeInTheDocument();
    });

    // ✅ 3️⃣ Test: Opens modal for adding a new strategy
    it("allows adding a new strategy", async () => {
        renderWithProviders(<Strategy />);

        fireEvent.click(screen.getByText("Add More Strategies"));

        fireEvent.change(screen.getByPlaceholderText("Strategy Title"), { target: { value: "New Strategy" } });

        const quillEditor = screen.getByTestId("editor");
        fireEvent.change(quillEditor, { target: { value: "<p>New Content</p>" } });

        fireEvent.click(screen.getByRole("button", { name: /Save/i }));

        await waitFor(() => {
            expect(mockCreateOrUpdateStrategy).toHaveBeenCalledWith({
                clientId: "123",
                data: { "New Strategy": "<p>New Content</p>" },
            });
        });
    });

    // ✅ 4️⃣ Test: Opens and edits an existing strategy
    it("allows editing an existing strategy", async () => {
        renderWithProviders(<Strategy />);

        fireEvent.click(screen.getByText("Test Strategy")); // Open edit modal

        fireEvent.change(screen.getByPlaceholderText("Strategy Title"), { target: { value: "Updated Strategy" } });

        const quillEditor = screen.getByTestId("editor");
        fireEvent.change(quillEditor, { target: { value: "<p>Updated Content</p>" } });

        fireEvent.click(screen.getByRole("button", { name: /Save/i }));

        await waitFor(() => {
            expect(mockCreateOrUpdateStrategy).toHaveBeenCalledWith({
                clientId: "123",
                data: { "Updated Strategy": "<p>Updated Content</p>" },
            });
        });
    });

    // ✅ 5️⃣ Test: Opens delete confirmation modal
    it("allows opening delete confirmation modal", async () => {
        renderWithProviders(<Strategy />);

        fireEvent.click(screen.getByText("🗑️"));

        expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    });

    // ✅ 6️⃣ Test: Confirms deletion of a strategy
    it("allows deleting a strategy", async () => {
        renderWithProviders(<Strategy />);

        fireEvent.click(screen.getByText("🗑️")); // Open delete modal

        fireEvent.click(screen.getByRole("button", { name: /Delete/i })); // Confirm delete

        await waitFor(() => {
            expect(mockDeleteStrategy).toHaveBeenCalledWith({
                clientId: "123",
                data: { title: "Test Strategy" },
            });
        });
    });
});
