import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import PlanForm from "../../src/pages/Clients/Plan";
import {
    useGetAssignedPlansForAccountManagerQuery,
    useGetClientPlanQuery,
    useCreateClientPlanMutation,
    useUpdateClientPlanMutation,
} from "../../src/services/api/clientApiSlice";
import { useGetPostAttributesByTypeQuery } from "../../src/services/api/postAttributeApiSlice";
import useCurrentUser from "../../src/hooks/useCurrentUser";
import { store } from "../../src/store/store";

// ✅ Mock API Hooks
vi.mock("../../src/services/api/clientApiSlice", () => ({
    useGetAssignedPlansForAccountManagerQuery: vi.fn(),
    useGetClientPlanQuery: vi.fn(),
    useCreateClientPlanMutation: vi.fn(),
    useUpdateClientPlanMutation: vi.fn(),
}));

vi.mock("../../src/services/api/postAttributeApiSlice", () => ({
    useGetPostAttributesByTypeQuery: vi.fn(),
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

// ✅ Utility function to render component with Redux Provider & Router
const renderWithProviders = (ui, { route = "/clients/123/plan" } = {}) => {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/clients/:clientId/plan" element={ui} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

describe("PlanForm Component", () => {
    let mockCreateClientPlan, mockUpdateClientPlan;

    beforeEach(() => {
        vi.resetAllMocks();

        // ✅ Mock role
        useCurrentUser.mockReturnValue({ role: "account_manager" });

        // ✅ Mock API return values
        useGetAssignedPlansForAccountManagerQuery.mockReturnValue({
            data: [
                {
                    standard_netprice: 100,
                    advanced_netprice: 200,
                    standard_plan_inclusion: "Basic services",
                    advanced_plan_inclusion: "Premium services",
                    pricing_attributes: { "blog_posts": 10, "social_posts": 5 },
                    pricing_platforms: { "linkedin": 20, "twitter": 15 },
                },
            ],
            isLoading: false,
        });
        

        useGetClientPlanQuery.mockReturnValue({
            data: { plan_type: "standard", platforms: {}, addon_attributes: {} },
            isLoading: false,
        });

        useGetPostAttributesByTypeQuery.mockReturnValue({
            data: [{ id: 1, name: "Blog Posts", is_active: true }, { id: 2, name: "Social Posts", is_active: true }],
            isLoading: false,
        });

        mockCreateClientPlan = vi.fn(() => Promise.resolve({}));
        useCreateClientPlanMutation.mockReturnValue([mockCreateClientPlan, { isLoading: false }]);

        mockUpdateClientPlan = vi.fn(() => Promise.resolve({}));
        useUpdateClientPlanMutation.mockReturnValue([mockUpdateClientPlan, { isLoading: false }]);
    });

    // ✅ 1️⃣ Test: Displays loading state
    it("shows a loading message when fetching plans", () => {
        useGetAssignedPlansForAccountManagerQuery.mockReturnValue({ data: null, isLoading: true });

        renderWithProviders(<PlanForm />);

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders plans and allows selection", async () => {
        renderWithProviders(<PlanForm />);
    
        // ✅ Wait for the loading message to disappear
        await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
    
        // ✅ Ensure the dropdown is found using test ID
        const select = screen.getByTestId("plan-select");
        expect(select).toBeInTheDocument();
    
        // ✅ Change the selection to "advanced"
        fireEvent.change(select, { target: { value: "advanced" } });
    
        // ✅ Wait for the UI update
        await waitFor(() => {
            expect(select.value).toBe("advanced");
        });
    
        // ✅ Verify "Premium services" appears (use `findByText` in case it's async)
        expect(await screen.findByText(/Premium services/i)).toBeInTheDocument();
    });
    

    it("allows adding and calculating add-ons", async () => {
        renderWithProviders(<PlanForm />);
    
        // ✅ Wait for loading state to disappear
        await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
    
        // ✅ Find the input field
        const blogInput = screen.getByPlaceholderText(/Enter number of Blog Posts/i);
        fireEvent.change(blogInput, { target: { value: "2" } });
    
        // ✅ Wait for the calculated value to update
        await waitFor(() => {
            expect(screen.getByText("$20")).toBeInTheDocument(); // Blog Posts: 10 * 2
        });
    
        const socialInput = screen.getByPlaceholderText(/Enter number of Social Posts/i);
        fireEvent.change(socialInput, { target: { value: "3" } });
    
        await waitFor(() => {
            expect(screen.getByText("$15")).toBeInTheDocument(); // Social Posts: 5 * 3
        });
    });
    

    it("allows platform selection and cost update", async () => {
        renderWithProviders(<PlanForm />);
    
        // ✅ Wait for loading state to disappear
        await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
    
        // ✅ Find the checkbox labels correctly
        const linkedInCheckbox = screen.getByRole("checkbox", { name: /LinkedIn/i });
        const twitterCheckbox = screen.getByRole("checkbox", { name: /Twitter/i });
    
        expect(linkedInCheckbox).toBeInTheDocument();
        expect(twitterCheckbox).toBeInTheDocument();
    
        // ✅ Click the checkboxes
        fireEvent.click(linkedInCheckbox);
        fireEvent.click(twitterCheckbox);
    
        // ✅ Wait for UI update
        await waitFor(() => {
            expect(screen.getByText("$20")).toBeInTheDocument(); // LinkedIn price
            expect(screen.getByText("$15")).toBeInTheDocument(); // Twitter price
        });
    });
    

    // ✅ 5️⃣ Test: Submits a new plan successfully
    it("submits a new plan", async () => {
        renderWithProviders(<PlanForm />);

        await waitForElementToBeRemoved(() => screen.getByText("Loading..."));

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "advanced" } });

        fireEvent.click(screen.getByRole("button", { name: /Update Plan/i }));

        await waitFor(() => {
            expect(mockCreateClientPlan).toHaveBeenCalledWith({
                clientId: "123",
                planData: expect.objectContaining({ plan_type: "advanced" }),
            });
        });
    });

    // ✅ 6️⃣ Test: Updates an existing plan successfully
    it("updates an existing plan", async () => {
        useGetClientPlanQuery.mockReturnValue({
            data: { plan_type: "advanced", platforms: {}, addon_attributes: {} },
            isLoading: false,
        });

        renderWithProviders(<PlanForm />);

        await waitForElementToBeRemoved(() => screen.getByText("Loading..."));

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "standard" } });

        fireEvent.click(screen.getByRole("button", { name: /Update Plan/i }));

        await waitFor(() => {
            expect(mockUpdateClientPlan).toHaveBeenCalledWith({
                clientId: "123",
                planData: expect.objectContaining({ plan_type: "standard" }),
            });
        });
    });
});
