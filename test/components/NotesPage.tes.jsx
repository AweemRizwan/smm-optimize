import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import NotesPage from "../../src/pages/Clients/Notes";
import { 
    useGetNotesQuery,
    useCreateOrUpdateNoteMutation,
    useDeleteNoteMutation,
    useToggleNoteFlagMutation
} from "../../src/services/api/notesApiSlice";
import { store } from "../../src/store/store";

// ✅ Mock API Hooks
vi.mock("../../src/services/api/notesApiSlice", () => ({
    useGetNotesQuery: vi.fn(),
    useCreateOrUpdateNoteMutation: vi.fn(),
    useDeleteNoteMutation: vi.fn(),
    useToggleNoteFlagMutation: vi.fn(),
}));

vi.mock("react-quill", () => {
    return {
        __esModule: true,
        default: ({ value, onChange }) => (
            <textarea data-testid="editor" value={value} onChange={(e) => onChange(e.target.value)} />
        ),
    };
});

const mockToggleNoteFlag = vi.fn(() => Promise.resolve({}));
useToggleNoteFlagMutation.mockReturnValue([mockToggleNoteFlag, { isLoading: false }]);



// ✅ Utility function to render component with Redux Provider & Router
const renderWithProviders = (ui, { route = "/clients/123/notes" } = {}) => {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/clients/:clientId/notes" element={ui} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

// ✅ TEST SUITE
describe("NotesPage Component", () => {
    let mockCreateOrUpdateNote, mockDeleteNote, mockToggleNoteFlag;


    beforeEach(() => {
        vi.resetAllMocks();

        // ✅ Mock API return values
        useGetNotesQuery.mockReturnValue({ data: [], isLoading: false });

        mockCreateOrUpdateNote = vi.fn(() => Promise.resolve({}));
        useCreateOrUpdateNoteMutation.mockReturnValue([mockCreateOrUpdateNote, { isLoading: false }]);

        mockDeleteNote = vi.fn(() => Promise.resolve({}));
        useDeleteNoteMutation.mockReturnValue([mockDeleteNote, { isLoading: false }]);

        mockToggleNoteFlag = vi.fn(() => Promise.resolve({}));
        useToggleNoteFlagMutation.mockReturnValue([mockToggleNoteFlag, { isLoading: false }]);
    });

    // ✅ 1️⃣ Test: Displays loading state
    it("shows a loading message when fetching notes", () => {
        useGetNotesQuery.mockReturnValue({ data: null, isLoading: true });

        renderWithProviders(<NotesPage />);

        expect(screen.getByText("Loading strategies...")).toBeInTheDocument();
    });

    // ✅ 2️⃣ Test: Displays empty state when no notes are available
    it("shows a message when no notes are available", () => {
        useGetNotesQuery.mockReturnValue({ data: [], isLoading: false });

        renderWithProviders(<NotesPage />);

        expect(screen.getByText("Add More Notes")).toBeInTheDocument();
    });

    // ✅ 3️⃣ Test: Displays notes when available
    it("renders notes correctly", async () => {
        const mockNotes = [
            { id: 1, note_title: "Test Note 1", message: "<p>Content 1</p>", note_flag: false },
            { id: 2, note_title: "Test Note 2", message: "<p>Content 2</p>", note_flag: true },
        ];

        useGetNotesQuery.mockReturnValue({ data: mockNotes, isLoading: false });

        renderWithProviders(<NotesPage />);

        expect(screen.getByText("Test Note 1")).toBeInTheDocument();
        expect(screen.getByText("Test Note 2")).toBeInTheDocument();
    });

    it("allows adding a new note", async () => {
        renderWithProviders(<NotesPage />);

        fireEvent.click(screen.getByText("Add More Notes"));
        fireEvent.change(screen.getByPlaceholderText("Note Title"), { target: { value: "New Note" } });

        const quillEditor = screen.getByTestId("editor"); // ✅ Use getByTestId
        fireEvent.change(quillEditor, { target: { value: "<p>New Content</p>" } });

        fireEvent.click(screen.getByRole("button", { name: /Save/i }));

        await waitFor(() => {
            expect(mockCreateOrUpdateNote).toHaveBeenCalledWith({
                id: null,
                note_title: "New Note",
                message: "<p>New Content</p>",
            });
        });
    });



    it("allows editing an existing note", async () => {
        const mockNotes = [{ id: 1, note_title: "Old Note", message: "<p>Old Content</p>", note_flag: false }];

        useGetNotesQuery.mockReturnValue({ data: mockNotes, isLoading: false });

        renderWithProviders(<NotesPage />);

        fireEvent.click(screen.getByText("Old Note")); // Open edit modal

        fireEvent.change(screen.getByPlaceholderText("Note Title"), { target: { value: "Updated Note" } });

        const quillEditor = screen.getByTestId("editor"); // ✅ Correctly targets ReactQuill's input
        fireEvent.change(quillEditor, { target: { value: "<p>Updated Content</p>" } });

        fireEvent.click(screen.getByRole("button", { name: /Save/i })); // Save changes

        await waitFor(() => {
            expect(mockCreateOrUpdateNote).toHaveBeenCalledWith({
                id: 1,
                note_title: "Updated Note",
                message: "<p>Updated Content</p>",
            });
        });
    });


    // ✅ 6️⃣ Test: Deleting a note
    it("allows deleting a note", async () => {
        const mockNotes = [{ id: 1, note_title: "Note to Delete", message: "<p>Delete Content</p>", note_flag: false }];

        useGetNotesQuery.mockReturnValue({ data: mockNotes, isLoading: false });

        renderWithProviders(<NotesPage />);

        fireEvent.click(screen.getByText("🗑️"));

        fireEvent.click(screen.getByRole("button", { name: /Delete/i }));

        await waitFor(() => {
            expect(mockDeleteNote).toHaveBeenCalledWith(1);
        });
    });

    it("allows pinning a note", async () => {
        const mockNotes = [
            { id: 1, note_title: "Pinned Note", message: "<p>Pinned Content</p>", note_flag: false },
        ];

        useGetNotesQuery.mockReturnValue({ data: mockNotes, isLoading: false });

        renderWithProviders(<NotesPage />);

        // ✅ Correctly find the "Pin Note" button
        const pinButton = screen.getByRole("button", { name: "Pin Note" });
        expect(pinButton).toBeInTheDocument();

        // Click the pin button
        fireEvent.click(pinButton);

        // Wait for the API call and assert it was called with correct arguments
        await waitFor(() => {
            expect(mockToggleNoteFlag).toHaveBeenCalledWith({
                id: 1,
                note_flag: true, // Expecting the note to be pinned
            });
        });
    });



    // ✅ 8️⃣ Test: Prevents pinning more than 3 notes
    it("prevents pinning more than 3 notes", async () => {
        global.alert = vi.fn();

        const mockNotes = [
            { id: 1, note_title: "Pinned 1", message: "<p>Content 1</p>", note_flag: true },
            { id: 2, note_title: "Pinned 2", message: "<p>Content 2</p>", note_flag: true },
            { id: 3, note_title: "Pinned 3", message: "<p>Content 3</p>", note_flag: true },
            { id: 4, note_title: "Unpinned", message: "<p>Content 4</p>", note_flag: false },
        ];

        useGetNotesQuery.mockReturnValue({ data: mockNotes, isLoading: false });

        renderWithProviders(<NotesPage />);

        fireEvent.click(screen.getAllByRole("button", { name: /pin/i })[3]); // Try pinning the 4th note

        expect(global.alert).toHaveBeenCalledWith("You can only pin up to 3 notes.");
    });
});
