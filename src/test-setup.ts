// Jest test setup
import 'jest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.exit
const mockExit = jest.fn();
process.exit = mockExit as never;

// Mock nanoid for predictable IDs in tests
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));