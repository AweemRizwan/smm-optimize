import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import CalendarPage from '../../src/pages/Clients/CalendarPage';
import { useParams } from 'react-router-dom';
import useCurrentUser from '../../src/hooks/useCurrentUser';
import { store } from '../../src/store/store';
import {
    useGetClientCalendarsQuery,
    useGetPostAttributesByTypeQuery,
    useListCalendarDatesQuery,
    useCreateCalendarDateMutation,
    useUpdateCalendarDateMutation,
    useDeleteCalendarDateMutation,
} from '../../src/services/api/calendarApiSlice';

// 🔥 Mock useParams to return specific clientId and calendarId
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useParams: vi.fn(),
}));

// 🔥 Mock hooks
vi.mock('../../src/hooks/useCurrentUser', () => ({
    default: vi.fn(),
}));

// ✅ Mock API Calls from `calendarApiSlice`
vi.mock('../../src/services/api/calendarApiSlice', async () => {
    const actualModule = await import('vitest').then(() => import('../../src/services/api/calendarApiSlice'));
    return {
        ...actualModule,
        useGetClientCalendarsQuery: vi.fn(),
        useGetPostAttributesByTypeQuery: vi.fn(),
        useListCalendarDatesQuery: vi.fn(),
        useCreateCalendarDateMutation: vi.fn(),
        useUpdateCalendarDateMutation: vi.fn(),
        useDeleteCalendarDateMutation: vi.fn(),
    };
});

// ✅ Utility function to wrap component in Redux Provider
const renderWithProvider = (component) => {
    return render(<Provider store={store}>{component}</Provider>);
};

// 🔥 TEST CASES
describe('CalendarPage Component', () => {
    beforeEach(() => {
        useParams.mockReturnValue({ clientId: '1', calendarId: '101' });
        useCurrentUser.mockReturnValue({ role: 'marketing_manager' });

        // ✅ Mock API Query Responses
        vi.mocked(useGetClientCalendarsQuery).mockReturnValue({
            data: [{ calendar_id: 101, month_name: 'January 2024' }],
            isLoading: false,
        });

        vi.mocked(useGetPostAttributesByTypeQuery).mockReturnValue({
            data: [{ id: 1, name: 'Post Type 1' }],
            isLoading: false,
        });

        vi.mocked(useListCalendarDatesQuery).mockReturnValue({
            data: [],
            isLoading: false,
        });

        vi.mocked(useCreateCalendarDateMutation).mockReturnValue([vi.fn(() => Promise.resolve({}))]);
        vi.mocked(useUpdateCalendarDateMutation).mockReturnValue([vi.fn(() => Promise.resolve({}))]);
        vi.mocked(useDeleteCalendarDateMutation).mockReturnValue([vi.fn(() => Promise.resolve({}))]);
    });

    // ✅ 1️⃣ Ensure the "Add Row" Button Appears for `marketing_manager`
    it('shows "Add Your First Row" button only for marketing manager', async () => {
        useCurrentUser.mockReturnValue({ role: 'marketing_manager' });

        renderWithProvider(<CalendarPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Add Your First Row/i })).toBeInTheDocument();
        });
    });

    it('hides "Add Your First Row" button for non-marketing users', async () => {
        useCurrentUser.mockReturnValue({ role: 'content_writer' });

        renderWithProvider(<CalendarPage />);

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /Add Your First Row/i })).not.toBeInTheDocument();
        });
    });

    it('adds a new row when clicking "Add Your First Row"', async () => {
        renderWithProvider(<CalendarPage />);
    
        const addButton = await screen.findByRole('button', { name: /Add Your First Row/i });
        fireEvent.click(addButton);
    
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Select a date')).toBeInTheDocument();
        });
    });
    

    // ✅ 3️⃣ Updating a Field Works for Correct Role
    it('allows content writer to edit the "Caption" field', async () => {
        useCurrentUser.mockReturnValue({ role: 'content_writer' });

        vi.mocked(useListCalendarDatesQuery).mockReturnValue({
            data: [{ id: '1', caption: 'Initial Caption' }],
            isLoading: false,
        });

        renderWithProvider(<CalendarPage />);

        const captionInput = await screen.findByDisplayValue('Initial Caption');
        fireEvent.change(captionInput, { target: { value: 'Updated Caption' } });

        await waitFor(() => {
            expect(captionInput.value).toBe('Updated Caption');
        });
    });

    it('prevents marketing manager from editing the "Caption" field', async () => {
        useCurrentUser.mockReturnValue({ role: 'marketing_manager' });

        vi.mocked(useListCalendarDatesQuery).mockReturnValue({
            data: [{ id: '1', caption: 'Initial Caption' }],
            isLoading: false,
        });

        renderWithProvider(<CalendarPage />);

        expect(screen.getByText('Initial Caption')).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: /Caption/i })).not.toBeInTheDocument();
    });

    // ✅ 4️⃣ Ensuring Only `marketing_manager` Can Delete Rows
    it('allows marketing manager to delete a row', async () => {
        const mockDelete = vi.fn(() => Promise.resolve({}));
        vi.mocked(useDeleteCalendarDateMutation).mockReturnValue([mockDelete]);

        useCurrentUser.mockReturnValue({ role: 'marketing_manager' });

        vi.mocked(useListCalendarDatesQuery).mockReturnValue({
            data: [{ id: '1', post_count: '10' }],
            isLoading: false,
        });

        renderWithProvider(<CalendarPage />);

        fireEvent.contextMenu(screen.getByText('10')); // Simulate right-click
        fireEvent.click(screen.getByText('Delete Row'));

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalled();
        });
    });

    // ✅ 5️⃣ Ensuring Only `account_manager` Can Edit Comments
    it('allows account manager to edit "Comments" field', async () => {
        useCurrentUser.mockReturnValue({ role: 'account_manager' });

        vi.mocked(useListCalendarDatesQuery).mockReturnValue({
            data: [{ id: '1', comments: 'Initial Comment' }],
            isLoading: false,
        });

        renderWithProvider(<CalendarPage />);

        const commentInput = await screen.findByDisplayValue('Initial Comment');
        fireEvent.change(commentInput, { target: { value: 'Updated Comment' } });

        await waitFor(() => {
            expect(commentInput.value).toBe('Updated Comment');
        });
    });

    it('prevents marketing manager from editing "Comments" field', async () => {
        useCurrentUser.mockReturnValue({ role: 'marketing_manager' });

        vi.mocked(useListCalendarDatesQuery).mockReturnValue({
            data: [{ id: '1', comments: 'Initial Comment' }],
            isLoading: false,
        });

        renderWithProvider(<CalendarPage />);

        expect(screen.getByText('Initial Comment')).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: /Comments/i })).not.toBeInTheDocument();
    });
});
