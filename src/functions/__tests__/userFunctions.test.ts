import * as admin from 'firebase-admin';
import functionsTest from 'firebase-functions-test';
import { createUser } from '../userFunctions';
import { CallableRequest } from 'firebase-functions/v2/https';

// Create a test environment with a mock project
const testEnv = functionsTest({
  projectId: 'test-project',
});

describe('User Functions', () => {
  let adminInitStub: jest.SpyInstance;
  let mockCreateUser: jest.Mock;
  let mockSet: jest.Mock;
  let mockServerTimestamp: jest.Mock;

  beforeAll(() => {
    // Mock Firebase Admin initialization
    adminInitStub = jest.spyOn(admin, 'initializeApp').mockImplementation();
    
    // Create mock functions
    mockCreateUser = jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    });
    
    mockSet = jest.fn().mockResolvedValue({});
    mockServerTimestamp = jest.fn().mockReturnValue(new Date());

    // Mock Firebase Auth
    jest.spyOn(admin, 'auth').mockImplementation(() => ({
      createUser: mockCreateUser,
    } as any));
    
    // Mock Firestore
    jest.spyOn(admin, 'firestore').mockImplementation(() => ({
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: mockSet,
    } as any));

    // Mock Firestore.FieldValue
    Object.defineProperty(admin.firestore, 'FieldValue', {
      get: () => ({
        serverTimestamp: mockServerTimestamp
      })
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    testEnv.cleanup();
  });

  beforeEach(() => {
    mockCreateUser.mockClear();
    mockSet.mockClear();
    mockServerTimestamp.mockClear();
  });

  it('should throw an error when called without authentication', async () => {
    const wrapped = testEnv.wrap(createUser);
    const request: CallableRequest = {
      data: { name: 'Test User', email: 'test@example.com' },
      auth: undefined,
      rawRequest: {} as any,
      acceptsStreaming: false
    };

    await expect(wrapped(request)).rejects.toThrow(
      'The function must be called while authenticated.'
    );
  });

  it('should create a user successfully', async () => {
    const wrapped = testEnv.wrap(createUser);
    const request: CallableRequest = {
      data: { name: 'Test User', email: 'test@example.com' },
      auth: {
        uid: 'test-uid',
        token: {
          uid: 'test-uid',
          sub: 'test-uid',
          aud: 'test-project',
          iss: 'https://securetoken.google.com/test-project',
          iat: Date.now() / 1000,
          exp: Date.now() / 1000 + 3600,
          auth_time: Date.now() / 1000,
          firebase: {
            sign_in_provider: 'custom',
            identities: {},
            sign_in_second_factor: 'none',
            second_factor_identifier: undefined,
            tenant: undefined
          }
        }
      },
      rawRequest: {} as any,
      acceptsStreaming: false
    };

    const result = await wrapped(request);

    expect(result).toEqual({
      uid: 'test-uid',
      name: 'Test User',
      email: 'test@example.com',
    });

    // Verify that the mocked functions were called with the correct arguments
    expect(mockCreateUser).toHaveBeenCalledWith({
      email: request.data.email,
      displayName: request.data.name,
    });

    expect(mockSet).toHaveBeenCalledWith({
      name: request.data.name,
      email: request.data.email,
      createdAt: expect.any(Date),
    });
  });
}); 