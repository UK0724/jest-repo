import * as admin from 'firebase-admin';
import functionsTest from 'firebase-functions-test';
import { createProduct } from '../productFunctions';
import { CallableRequest } from 'firebase-functions/v2/https';
import { createMockFirebaseAdmin, createTestRequest } from '../utils/firebaseUtils';

// Create a test environment with a mock project
const testEnv = functionsTest({
  projectId: 'test-project',
});

describe('Product Functions', () => {
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
    const wrapped = testEnv.wrap(createProduct);
    const request: CallableRequest = {
      data: { 
        name: 'Test Product', 
        description: 'Test Description', 
        price: 99.99,
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

  it('should throw an error when user tries to create product for another user', async () => {
    const wrapped = testEnv.wrap(createProduct);
    const testData = { 
      name: 'Test Product', 
      description: 'Test Description', 
      price: 99.99,
      userId: 'different-user-id'
    };
    
    const request = createTestRequest(testData, 'test-user-id');

    await expect(wrapped(request)).rejects.toThrow(
      'You can only create products for your own user account.'
    );
  });

  it('should create a product successfully', async () => {
    const wrapped = testEnv.wrap(createProduct);
    const testData = { 
      name: 'Test Product', 
      description: 'Test Description', 
      price: 99.99,
      userId: 'test-user-id'
    };
    
    const request = createTestRequest(testData);

    const result = await wrapped(request);

    expect(result).toEqual({
      id: 'test-doc-id',
      name: testData.name,
      description: testData.description,
      price: testData.price,
      userId: testData.userId,
    });

    // Verify that the mocked functions were called with the correct arguments
    expect(mockFirebase.mockAdd).toHaveBeenCalledWith({
      name: testData.name,
      description: testData.description,
      price: testData.price,
      userId: testData.userId,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
}); 