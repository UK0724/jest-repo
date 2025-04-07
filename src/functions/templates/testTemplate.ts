import functionsTest from 'firebase-functions-test';
import { yourFunction } from '../functionTemplate'; // Update this import
import { CallableRequest } from 'firebase-functions/v2/https';
import { createMockFirebaseAdmin, createTestRequest } from '../utils/firebaseUtils';

// =============================================
// TEMPLATE FOR CREATING TESTS FOR FIREBASE FUNCTIONS
// =============================================
// To use this template:
// 1. Copy this file to a new file in the src/functions/__tests__ directory
// 2. Rename the file to match your function (e.g., functionTemplate.test.ts)
// 3. Update the import to point to your function file
// 4. Update the test cases to match your function's behavior
// =============================================

// Create a test environment with a mock project
const testEnv = functionsTest({
  projectId: 'test-project',
});

describe('Your Function Tests', () => {
  let adminInitStub: jest.SpyInstance;
  const mockFirebase = createMockFirebaseAdmin();

  beforeAll(() => {
    // Setup mocks
    adminInitStub = mockFirebase.setupMocks().mockAdd;
  });

  afterAll(() => {
    jest.restoreAllMocks();
    testEnv.cleanup();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    mockFirebase.mockAdd.mockClear();
    mockFirebase.mockServerTimestamp.mockClear();
  });

  it('should throw an error when called without authentication', async () => {
    const wrapped = testEnv.wrap(yourFunction);
    const request: CallableRequest = {
      data: { 
        field1: 'Test Value', 
        field2: 42,
        userId: 'test-user-id'
      },
      auth: undefined,
      rawRequest: {} as any,
      acceptsStreaming: false
    };

    await expect(wrapped(request)).rejects.toThrow(
      'The function must be called while authenticated.'
    );
  });

  it('should throw an error when user tries to access another user\'s data', async () => {
    const wrapped = testEnv.wrap(yourFunction);
    const testData = { 
      field1: 'Test Value', 
      field2: 42,
      userId: 'different-user-id'
    };
    
    const request = createTestRequest(testData, 'test-user-id');

    await expect(wrapped(request)).rejects.toThrow(
      'You can only perform this action for your own user account.'
    );
  });

  it('should execute the function successfully', async () => {
    const wrapped = testEnv.wrap(yourFunction);
    const testData = { 
      field1: 'Test Value', 
      field2: 42,
      userId: 'test-user-id'
    };
    
    const request = createTestRequest(testData);

    const result = await wrapped(request);

    expect(result).toEqual({
      id: 'test-doc-id',
      field1: testData.field1,
      field2: testData.field2,
      userId: testData.userId,
    });

    // Verify that the mocked functions were called with the correct arguments
    expect(mockFirebase.mockAdd).toHaveBeenCalledWith({
      field1: testData.field1,
      field2: testData.field2,
      userId: testData.userId,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
}); 