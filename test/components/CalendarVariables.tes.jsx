import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { http } from 'msw';
import { setupStore } from '../../src/store/store';
import CalendarVariables from '../../src/pages/Profile/CalendarVariables';
import { API_ROUTES } from '../../src/constants/apiRoutes';
import { vi } from 'vitest';

// ✅ Mock API Data
const mockPostAttributes = {
    postTypes: [
        { id: 1, name: 'Blog Post', is_active: true },
        { id: 2, name: 'Video', is_active: false }
    ],
    postCategories: [
        { id: 3, name: 'Marketing', is_active: true },
        { id: 4, name: 'Tech', is_active: false }
    ],
    postCTAs: [
        { id: 5, name: 'Subscribe Now', is_active: true },
        { id: 6, name: 'Learn More', is_active: false }
    ]
};

// ✅ Set up Mock API Server with Correct Routes
const server = setupServer(
    http.get(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.BY_TYPE('post_type')}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([
            { id: 1, name: 'Blog Post', is_active: true },
            { id: 2, name: 'Video', is_active: false }
        ]));
    }),
    http.get(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.BY_TYPE('post_category')}`, (req, res, ctx) => {
        console.log("📡 Mock API received GET request for post_category"); // Debugging
        return res(ctx.status(200), ctx.json(mockPostAttributes.postCategories));
    }),
    http.get(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.BY_TYPE('post_cta')}`, (req, res, ctx) => {
        console.log("📡 Mock API received GET request for post_cta"); // Debugging
        return res(ctx.status(200), ctx.json(mockPostAttributes.postCTAs));
    }),
    http.post(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.LIST_CREATE}`, async (req, res, ctx) => {
        const newPostAttribute = await req.json();
        console.log("📡 Mock API received new attribute:", newPostAttribute);
        return res(ctx.status(201), ctx.json({ id: Date.now(), ...newPostAttribute }));
    }),
    http.patch(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.UPDATE(':id')}`, async (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ message: 'Updated successfully' }));
    })
);

// ✅ Setup MSW server lifecycle
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ✅ Utility function to render `CalendarVariables`
const renderCalendarVariables = () => {
    const testStore = setupStore();
    return render(
        <Provider store={testStore}>
            <MemoryRouter>
                <CalendarVariables />
            </MemoryRouter>
        </Provider>
    );
};

// ✅ Test Suite
describe('CalendarVariables Component', () => {
    test('Displays loading state initially', async () => {
        renderCalendarVariables();
        expect(screen.getByText(/Loading Post Types/i)).toBeInTheDocument();
        expect(screen.getByText(/Loading Post Categories/i)).toBeInTheDocument();
        expect(screen.getByText(/Loading Post CTAs/i)).toBeInTheDocument();
    });

    test('Renders tables with post attributes after loading', async () => {
        renderCalendarVariables();

        // ✅ Wait for data to load properly
        await waitFor(() => {
            expect(screen.getByText(/Blog Post/i)).toBeInTheDocument();
            expect(screen.getByText(/Video/i)).toBeInTheDocument();
            expect(screen.getByText(/Marketing/i)).toBeInTheDocument();
            expect(screen.getByText(/Tech/i)).toBeInTheDocument();
            expect(screen.getByText(/Subscribe Now/i)).toBeInTheDocument();
            expect(screen.getByText(/Learn More/i)).toBeInTheDocument();
        });
    });

    test('Opens modal with correct title when clicking Add buttons', async () => {
        renderCalendarVariables();

        // ✅ Click "Add Post Type" and verify modal title
        const postTypeButton = screen.getByRole('button', { name: /Add Post Type/i });
        fireEvent.click(postTypeButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Add Post Type/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /×/i }));
        await waitFor(() => expect(screen.queryByRole('heading', { name: /Add Post Type/i })).not.toBeInTheDocument());

        // ✅ Click "Add Post Category" and verify modal title
        const postCategoryButton = screen.getByRole('button', { name: /Add Post Category/i });
        fireEvent.click(postCategoryButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Add Post Category/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /×/i }));
        await waitFor(() => expect(screen.queryByRole('heading', { name: /Add Post Category/i })).not.toBeInTheDocument());

        // ✅ Click "Add Post CTA" and verify modal title
        const postCTAButton = screen.getByRole('button', { name: /Add Post CTA/i });
        fireEvent.click(postCTAButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Add Post CTA/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /×/i }));
        await waitFor(() => expect(screen.queryByRole('heading', { name: /Add Post CTA/i })).not.toBeInTheDocument());
    });
    
    test('Toggles post type status', async () => {
        renderCalendarVariables();

        await waitFor(() => expect(screen.getByText(/Blog Post/i)).toBeInTheDocument());

        // ✅ Find and toggle "Active" button
        const toggleButton = screen.getAllByText(/Active/i)[0];
        fireEvent.click(toggleButton);

        await waitFor(() => {
            console.log("🔎 Checking if status toggle API was called...");
            expect(toggleButton).toHaveTextContent('Inactive');
        });
    });

    test('Handles API failure when toggling status', async () => {
        server.use(
            http.patch(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.UPDATE(':id')}`, (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );

        renderCalendarVariables();

        await waitFor(() => expect(screen.getByText(/Blog Post/i)).toBeInTheDocument());

        const toggleButton = screen.getAllByText(/Active/i)[0];
        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(toggleButton).toHaveTextContent('Active'); // ✅ Status should remain unchanged
        });
    });
});
