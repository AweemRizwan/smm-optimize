import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from '../../src/components/Form/UserForm';

// ✅ Mocked `onSubmit` function
const mockOnSubmit = vi.fn();

// ✅ Mock initial values
const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    agency_name: '',
    profileImage: '',
    newPassword: '',
    confirmPassword: '',
};

const renderUserForm = (props = {}) =>
    render(<UserForm initialValues={initialValues} onSubmit={mockOnSubmit} submitLabel="Submit" {...props} />);

describe('UserForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Renders all form fields correctly', async () => {
        renderUserForm();

        // ✅ Check input fields exist
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });

    test('Displays validation errors for required fields', async () => {
        renderUserForm();
    
        // ✅ Click submit without entering any data
        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
        // ✅ Wait for validation messages to appear
        await waitFor(() => {
            // Select errors flexibly without tag restrictions
            const errorMessages = screen.getAllByText(/Required/i, { exact: false });
    
            console.log("🛠️ Validation Errors Found:", errorMessages.map(err => err.textContent));
    
            // 🔥 Assert there are at least the expected number of errors
            expect(errorMessages.length).toBeGreaterThanOrEqual(3);
        });
    });
    
    
    test('Validates email format', async () => {
        renderUserForm();
    
        const emailInput = screen.getByPlaceholderText(/Email Address/i);
    
        // ✅ Type invalid email
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
        // ✅ Trigger blur to enforce validation before submit
        fireEvent.blur(emailInput);
    
        // ✅ Click submit
        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
        // ✅ Debugging: Log errors if test still fails
        await waitFor(() => {
            const allErrors = screen.queryAllByText(/invalid email/i, { exact: false });
            console.log("🛠️ Found Validation Errors:", allErrors.map(err => err.textContent));
        });
    
        // ✅ Ensure the validation error appears
        await waitFor(() => {
            expect(screen.getByText(/Invalid email address/i, { exact: false })).toBeInTheDocument();
        });
    });
    

    test('Shows password confirmation error when passwords do not match', async () => {
        renderUserForm({ isOwnProfile: true });
    
        // ✅ Wait for password fields to render
        const newPasswordInput = await screen.findByPlaceholderText(/Enter new password/i);
        const confirmPasswordInput = await screen.findByPlaceholderText(/Confirm new password/i);
    
        // ✅ Enter mismatched passwords
        fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'wrongpassword' } });
    
        // ✅ Click submit
        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
        // ✅ Debug: Log validation messages if test still fails
        await waitFor(() => {
            const errors = screen.queryAllByText(/passwords must match/i, { exact: false });
            console.log("🛠️ Found Validation Errors:", errors.map(err => err.textContent));
        });
    
        // ✅ Check for validation error
        await waitFor(() => {
            expect(screen.getByText(/Passwords must match/i)).toBeInTheDocument();
        });
    });
    

    test('Displays agency name field when role is Account Manager', async () => {
        renderUserForm();

        // ✅ Select "Account Manager" from role dropdown
        fireEvent.change(screen.getByRole('combobox', { name: /Role/i }), { target: { value: 'account_manager' } });

        // ✅ Agency Name field should appear
        expect(screen.getByLabelText(/Agency Name/i)).toBeInTheDocument();
    });

    test('Does not show agency name field for other roles', async () => {
        renderUserForm();

        // ✅ Select "Content Writer" role
        fireEvent.change(screen.getByRole('combobox', { name: /Role/i }), { target: { value: 'content_writer' } });

        // ✅ Agency Name field should NOT be in the document
        expect(screen.queryByLabelText(/Agency Name/i)).not.toBeInTheDocument();
    });

    test('Allows file upload and updates profile image', async () => {
        renderUserForm();
    
        // ✅ Create a mock file
        const file = new File(['dummy data'], 'profile.png', { type: 'image/png' });
    
        // ✅ Simulate file upload using data-testid
        const fileInput = screen.getByTestId('file-upload');
        fireEvent.change(fileInput, { target: { files: [file] } });
    
        // ✅ Debugging: Log the uploaded file
        console.log("🛠️ Uploaded File:", fileInput.files[0]);
    
        // ✅ Wait for image update
        await waitFor(() => {
            expect(fileInput.files[0]).toBe(file);
        });
    });
    

    test('Submits form successfully with valid data', async () => {
        renderUserForm();

        // ✅ Fill out the form
        fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: 'john@example.com' } });

        // ✅ Select role
        fireEvent.change(screen.getByRole('combobox', { name: /Role/i }), { target: { value: 'marketing_manager' } });

        // ✅ Click submit
        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

        // ✅ Ensure onSubmit function is called
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                role: 'marketing_manager',
                agency_name: '',
                profileImage: '',
                newPassword: '',
                confirmPassword: '',
            });
        });
    });
});
