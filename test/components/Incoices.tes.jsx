import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import Invoices from "../../src/pages/Clients/Invoices";
import { useGetClientInvoicesQuery, useCreateClientInvoiceMutation, useUpdateClientInvoiceMutation } from "../../src/services/api/clientApiSlice";
import useCurrentUser from "../../src/hooks/useCurrentUser";
import { store } from "../../src/store/store";

// 🔥 Mock `useParams`
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

// 🔥 Mock `useCurrentUser`
vi.mock("../../src/hooks/useCurrentUser", () => ({
    default: vi.fn(),
}));

// 🔥 Mock API Hooks
vi.mock("../../src/services/api/clientApiSlice", () => ({
    useGetClientInvoicesQuery: vi.fn(),
    useCreateClientInvoiceMutation: vi.fn(),
    useUpdateClientInvoiceMutation: vi.fn(),
}));

// ✅ Utility function to render component with Redux Provider & Router
const renderWithProviders = (ui, { route = "/clients/123/invoices" } = {}) => {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/clients/:clientId/invoices" element={ui} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

// 🔥 TEST SUITE
describe("Invoices Component", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        useCurrentUser.mockReturnValue({ role: "account_manager" });

        useGetClientInvoicesQuery.mockReturnValue({ data: [], isLoading: false });
        useCreateClientInvoiceMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
        useUpdateClientInvoiceMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    });

    // ✅ 1️⃣ Test: Displays loading state
    it("shows a loading message when fetching invoices", () => {
        useGetClientInvoicesQuery.mockReturnValue({ data: null, isLoading: true });

        renderWithProviders(<Invoices />);

        expect(screen.getByText("Loading invoices...")).toBeInTheDocument();
    });

    // ✅ 2️⃣ Test: Displays empty state when no invoices are available
    it("shows a message when no invoices are available", () => {
        useGetClientInvoicesQuery.mockReturnValue({ data: [], isLoading: false });

        renderWithProviders(<Invoices />);

        expect(screen.getByText("No invoices available at the moment.")).toBeInTheDocument();
    });

    // ✅ 3️⃣ Test: Displays a list of invoices when available
    it("renders a list of invoices correctly", async () => {
        const mockInvoices = [
            { id: 1, billing_from: "January 2024", billing_to: "February 2024", invoice: "https://example.com/invoice1.pdf", submission_status: "unpaid", payment_url: "https://payment.com/1" },
            { id: 2, billing_from: "March 2024", billing_to: "April 2024", invoice: "https://example.com/invoice2.pdf", submission_status: "paid", payment_url: "https://payment.com/2" },
        ];

        useGetClientInvoicesQuery.mockReturnValue({ data: mockInvoices, isLoading: false });

        renderWithProviders(<Invoices />);

        expect(screen.getByText("January 2024")).toBeInTheDocument();
        expect(screen.getByText("February 2024")).toBeInTheDocument();
        expect(screen.getByText("March 2024")).toBeInTheDocument();
        expect(screen.getByText("April 2024")).toBeInTheDocument();

        // Fix for multiple "View" links
        const viewLinks = screen.getAllByRole("link", { name: /View/i });
        expect(viewLinks.length).toBe(mockInvoices.length);
    });

    // ✅ 4️⃣ Test: Adding a new invoice (Accountant role)
    it("allows adding a new invoice", async () => {
        useCurrentUser.mockReturnValue({ role: "accountant" });

        const mockCreateInvoice = vi.fn(() => Promise.resolve({}));
        useCreateClientInvoiceMutation.mockReturnValue([mockCreateInvoice, { isLoading: false }]);

        renderWithProviders(<Invoices />);

        // Select billing dates
        fireEvent.change(screen.getByPlaceholderText("Select Billing From"), { target: { value: "January 2024" } });
        fireEvent.change(screen.getByPlaceholderText("Select Billing To"), { target: { value: "February 2024" } });

        // Upload invoice (Ensure test finds the correct input)
        const fileInput = screen.getByLabelText("Upload Invoice"); // Ensure label exists
        const testFile = new File(["dummy content"], "invoice.pdf", { type: "application/pdf" });

        fireEvent.change(fileInput, { target: { files: [testFile] } });

        // Click submit
        fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

        // Ensure API call is triggered
        await waitFor(() => {
            expect(mockCreateInvoice).toHaveBeenCalled();
        });
    });

    // ✅ 5️⃣ Test: Updating invoice status (Account Manager role)
    it("allows updating invoice status", async () => {
        useCurrentUser.mockReturnValue({ role: "account_manager" });

        const mockUpdateInvoice = vi.fn(() => Promise.resolve({}));
        useUpdateClientInvoiceMutation.mockReturnValue([mockUpdateInvoice, { isLoading: false }]);

        const mockInvoices = [
            {
                id: 1,
                billing_from: "January 2024",
                billing_to: "February 2024",
                invoice: "https://example.com/invoice1.pdf",
                submission_status: "wait_for_approval", // Correct status ID
                payment_url: "https://payment.com/1",
            },
        ];

        useGetClientInvoicesQuery.mockReturnValue({ data: mockInvoices, isLoading: false });

        renderWithProviders(<Invoices />);

        // Locate the dropdown button for status update
        const dropdownButton = screen.getByText("WAITING FOR APPROVAL"); // Ensure correct display text
        fireEvent.click(dropdownButton);

        // Select a new status from the dropdown (e.g., "Unpaid")
        const newStatus = screen.getByText("Unpaid");
        fireEvent.click(newStatus);

        await waitFor(() => {
            expect(mockUpdateInvoice).toHaveBeenCalledWith({
                clientId: "123",
                invoiceId: 1,
                formData: expect.any(FormData), // Ensure FormData is passed
            });
        });
    });


    // ✅ 6️⃣ Test: Updating payment link (Account Manager role)
    it("allows updating the payment link", async () => {
        useCurrentUser.mockReturnValue({ role: "account_manager" });

        const mockUpdateInvoice = vi.fn(() => Promise.resolve({}));
        useUpdateClientInvoiceMutation.mockReturnValue([mockUpdateInvoice, { isLoading: false }]);

        const mockInvoices = [
            { id: 1, billing_from: "January 2024", billing_to: "February 2024", invoice: "https://example.com/invoice1.pdf", submission_status: "wait for approval", payment_url: "" },
        ];

        useGetClientInvoicesQuery.mockReturnValue({ data: mockInvoices, isLoading: false });

        renderWithProviders(<Invoices />);

        const paymentLinkInput = screen.getByPlaceholderText("Enter Payment Link");
        fireEvent.change(paymentLinkInput, { target: { value: "https://new-payment.com" } });

        await waitFor(() => {
            expect(mockUpdateInvoice).toHaveBeenCalled();
        });
    });
});
