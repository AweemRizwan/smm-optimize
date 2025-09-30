// import { http, HttpResponse } from 'msw';
// import { API_ROUTES } from '../../src/constants/apiRoutes';

// const mockMessages = [
//     {
//         id: 1,
//         message: 'Hello, this is a test message!',
//         sender_info: { first_name: 'John', last_name: 'Doe', role: 'Admin' },
//         created_at: '2024-02-11T12:00:00Z',
//     },
// ];

// // ✅ Mock User Roles Data
// const mockUsersByRole = {
//     marketing_manager: [{ id: '1', first_name: 'Alice', last_name: 'Doe' }],
//     marketing_assistant: [{ id: '2', first_name: 'Bob', last_name: 'Smith' }],
//     graphics_designer: [{ id: '3', first_name: 'Charlie', last_name: 'Brown' }],
//     content_writer: [{ id: '4', first_name: 'David', last_name: 'Lee' }],
// };

// const mockClients = [
//     {
//         id: '1',
//         created_at: '2024-01-15T12:00:00Z',
//         business_name: 'Test Business 1',
//         client_plan: {
//             plan_type: 'Premium',
//             add_on_attributes: { seo: '5' },
//             plan_attributes: { ads: '10' },
//             platforms: { facebook: true, instagram: false }
//         },
//         invoice: 'view invoice',
//         team: { name: 'Marketing Team' }
//     },
// ];

// const mockTeams = [
//     { team_id: 'team1', name: 'Team Alpha', members_count: 5, clients_count: 3 },
//     { team_id: 'team2', name: 'Team Beta', members_count: 3, clients_count: 2 },
// ];

// const mockMeetings = [
//     {
//         id: 1,
//         date: '2024-02-15',
//         time: '10:30',
//         meeting_name: 'Project Kickoff',
//         client_name: 'Client A',
//         meeting_link: 'https://meet.google.com/xyz',
//         details: ['John Doe', 'Jane Smith'],
//         is_completed: false,
//     },
// ];

// const mockPostAttributes = {
//     postTypes: [
//         { id: 1, name: 'Blog Post', is_active: true },
//         { id: 2, name: 'Video', is_active: false }
//     ],
//     postCategories: [
//         { id: 3, name: 'Marketing', is_active: true },
//         { id: 4, name: 'Tech', is_active: false }
//     ],
//     postCTAs: [
//         { id: 5, name: 'Subscribe Now', is_active: true },
//         { id: 6, name: 'Learn More', is_active: false }
//     ]
// };

// const mockUsers = [
//     {
//         id: 1,
//         first_name: "John",
//         last_name: "Doe",
//         email: "john.doe@example.com",
//         role_display: "Admin",
//         teams: [{ name: "Development" }],
//     },
//     {
//         id: 2,
//         first_name: "Jane",
//         last_name: "Smith",
//         email: "jane.smith@example.com",
//         role_display: "Manager",
//         teams: [],
//     },
// ];


// export const handlers = [
    
//     // ✅ Get Users
//     http.get(`http://localhost:5000${API_ROUTES.USERS.LIST}`, async () => {
//         console.log("📡 Mock API: Fetching Users");
//         return HttpResponse.json(mockUsers, { status: 200 });
//     }),

//     // ✅ Delete User
//     http.delete(`http://localhost:5000${API_ROUTES.USERS.DELETE(':id')}`, async ({ params }) => {
//         console.log(`📡 Mock API: Deleting user with ID ${params.id}`);

//         const userIndex = mockUsers.findIndex(user => user.id === Number(params.id));
//         if (userIndex !== -1) {
//             mockUsers.splice(userIndex, 1);
//             return HttpResponse.json({ message: 'User deleted successfully' });
//         }

//         return HttpResponse.json({ error: 'User not found' }, { status: 404 });
//     }),
    

//     // ✅ Get Messages
//     http.get('http://localhost:5000/clients/:clientId/threads', async () => {
//         return HttpResponse.json(mockMessages, { status: 200 });
//     }),

//     // ✅ Post a New Message
//     http.post('http://localhost:5000/clients/:clientId/threads', async ({ request }) => {
//         const { message } = await request.json();
//         const newMessage = {
//             id: mockMessages.length + 1,
//             message,
//             sender_info: { first_name: 'You', last_name: '', role: 'User' },
//             created_at: new Date().toISOString(),
//         };
//         mockMessages.push(newMessage);
//         return HttpResponse.json(newMessage, { status: 201 });
//     }),

//     // ✅ Login
//     http.post('http://localhost:5000/auth/login', async ({ request }) => {
//         const { username, password } = await request.json();
//         if (username === 'testuser' && password === 'password123') {
//             return HttpResponse.json({ message: 'Login successful' }, { status: 200 });
//         }
//         return HttpResponse.json({ message: 'Invalid username or password' }, { status: 401 });
//     }),

//     // ✅ Fetch Clients
//     http.get('http://localhost:5000/clients', async () => {
//         return HttpResponse.json(mockClients, { status: 200 });
//     }),

//     // ✅ Delete Client
//     http.delete('http://localhost:5000/clients/:id', async ({ params }) => {
//         const clientIndex = mockClients.findIndex(client => client.id === params.id);
//         if (clientIndex !== -1) {
//             mockClients.splice(clientIndex, 1);
//             return HttpResponse.json({ message: 'Client deleted successfully' }, { status: 200 });
//         }
//         return HttpResponse.json({ error: 'Client not found' }, { status: 404 });
//     }),

//     // ✅ Assign Client to Team
//     http.patch('http://localhost:5000/clients/:id/assign-team', async ({ params, request }) => {
//         const { team_id } = await request.json();
//         const assignedClient = mockClients.find(client => client.id === params.id);
//         if (assignedClient) {
//             assignedClient.team = { name: mockTeams.find(team => team.team_id === team_id)?.name || 'Unknown Team' };
//             return HttpResponse.json({ message: 'Client assigned successfully' }, { status: 200 });
//         }
//         return HttpResponse.json({ error: 'Client not found' }, { status: 404 });
//     }),

//     // ✅ Fetch Teams
//     http.get('http://localhost:5000/teams', async () => {
//         return HttpResponse.json(mockTeams, { status: 200 });
//     }),

//     // ✅ Create Meeting
//     http.post('http://localhost:5000/meetings', async ({ request }) => {
//         return HttpResponse.json({ message: 'Meeting created successfully!' }, { status: 201 });
//     }),

//     // ✅ Get Meetings
//     http.get('http://localhost:5000/meetings', async () => {
//         return HttpResponse.json(mockMeetings, { status: 200 });
//     }),

//     // ✅ Mark Meeting as Completed
//     http.patch('http://localhost:5000/meetings/:id', async () => {
//         return HttpResponse.json({ message: 'Meeting marked as completed' }, { status: 200 });
//     }),

//     // ✅ Fetch Post Attributes
//     http.get(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.BY_TYPE('post_type')}`, async () => {
//         return HttpResponse.json(mockPostAttributes.postTypes, { status: 200 });
//     }),

//     http.get(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.BY_TYPE('post_category')}`, async () => {
//         return HttpResponse.json(mockPostAttributes.postCategories, { status: 200 });
//     }),

//     http.get(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.BY_TYPE('post_cta')}`, async () => {
//         return HttpResponse.json(mockPostAttributes.postCTAs, { status: 200 });
//     }),

//     http.post('http://localhost:5000/post-attributes', async ({ request }) => {
//         const newAttribute = await request.json();
//         console.log("📡 Mock API: Adding new attribute:", newAttribute);

//         // Add new attribute to the mock data
//         const addedAttribute = { id: Date.now(), ...newAttribute };
//         mockPostAttributes.postTypes.push(addedAttribute);

//         return HttpResponse.json(addedAttribute, { status: 201 });
//     }),

//     http.patch(`http://localhost:5000${API_ROUTES.POST_ATTRIBUTES.UPDATE(':id')}`, async ({ params, request }) => {
//         const { id } = params;
//         const { is_active } = await request.json();
//         console.log(`📡 Mock API: Toggling status for Post Attribute ID ${id}`);

//         // Find the attribute and update its status
//         const attribute = mockPostAttributes.postTypes.find(attr => attr.id === parseInt(id));
//         if (attribute) {
//             attribute.is_active = is_active;
//             return HttpResponse.json({ message: 'Updated successfully', is_active }, { status: 200 });
//         }

//         return HttpResponse.json({ error: 'Post attribute not found' }, { status: 404 });
//     }),

//     http.get(`http://localhost:5000${API_ROUTES.USERS.BY_ROLE}`, async ({ request }) => {
//         const url = new URL(request.url);
//         const role = url.searchParams.get('role');
        
//         if (mockUsersByRole[role]) {
//             return HttpResponse.json(mockUsersByRole[role], { status: 200 });
//         } else {
//             return HttpResponse.json([], { status: 200 }); // Return empty if role is not found
//         }
//     }),

//     // ✅ Mock Create Team
//     http.post('http://localhost:5000/teams', async ({ request }) => {
//         const newTeam = await request.json();
//         console.log("📡 Mock Create Team API Called:", JSON.stringify(newTeam, null, 2));

//         return HttpResponse.json({ message: 'Team created successfully!' }, { status: 201 });
//     }),

// ];
