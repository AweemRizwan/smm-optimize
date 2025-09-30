// Import Jest DOM matchers for better assertions
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
// Mock Service Worker setup
import { afterAll, afterEach, beforeAll , vi } from 'vitest';


const server = setupServer(...handlers);

beforeAll(() => {
    server.listen();
    global.window.alert = vi.fn(); // ✅ Fixes "Not implemented: window.alert" in Vitest
  });
  
  afterEach(() => {
    vi.restoreAllMocks(); // ✅ Reset mocks after each test
    server.resetHandlers();
  });  
afterAll(() => server.close());  // Close the server after all tests