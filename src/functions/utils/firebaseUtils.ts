import * as admin from 'firebase-admin';
import { CallableRequest } from 'firebase-functions/v2/https';

/**
 * Initialize Firebase Admin if not already initialized
 * This function should be called at the beginning of any file that uses Firebase Admin
 */
export const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    console.log('Initializing Firebase Admin...');
    console.log('Current project ID:', 'fakeProject');
    
    // For local development with emulators
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    
    // Log environment variables
    console.log('FIRESTORE_EMULATOR_HOST:', process.env.FIRESTORE_EMULATOR_HOST);
    console.log('FIREBASE_AUTH_EMULATOR_HOST:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
    
    try {
      admin.initializeApp({
        projectId: 'fakeProject', // Match the emulator project ID
      });
      
      console.log('Firebase Admin initialized with emulator settings');
      
      // Test Firestore connection
      const db = admin.firestore();
      console.log('Firestore instance created');
      
      // Log Firestore settings
      console.log('Firestore settings:', db.settings);
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  } else {
    console.log('Firebase Admin already initialized');
  }
  
  return admin;
};

/**
 * Create a test request object for local testing
 * @param data The data to include in the request
 * @param userId The user ID to use for authentication
 * @returns A test request object
 */
export const createTestRequest = <T>(data: T, userId: string = 'test-user-id'): CallableRequest<T> => {
  return {
    auth: {
      uid: userId,
      token: {
        uid: userId,
        sub: userId,
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
    data,
    rawRequest: {} as any,
    acceptsStreaming: false
  };
};

/**
 * Create a mock Firebase Admin object for testing
 * @returns An object with mocked Firebase Admin methods
 */
export const createMockFirebaseAdmin = () => {
  const mockAdd = jest.fn().mockResolvedValue({
    id: 'test-doc-id',
  });
  
  const mockServerTimestamp = jest.fn().mockReturnValue(new Date());
  
  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: mockAdd,
  };
  
  const mockAuth = {
    createUser: jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    }),
  };
  
  return {
    mockAdd,
    mockServerTimestamp,
    mockFirestore,
    mockAuth,
    setupMocks: () => {
      // Mock Firebase Admin initialization
      jest.spyOn(admin, 'initializeApp').mockImplementation();
      
      // Mock Firestore
      jest.spyOn(admin, 'firestore').mockImplementation(() => mockFirestore as any);
      
      // Mock Auth
      jest.spyOn(admin, 'auth').mockImplementation(() => mockAuth as any);
      
      // Mock Firestore.FieldValue
      Object.defineProperty(admin.firestore, 'FieldValue', {
        get: () => ({
          serverTimestamp: mockServerTimestamp
        })
      });
      
      return {
        mockAdd,
        mockServerTimestamp,
        mockFirestore,
        mockAuth,
      };
    },
  };
}; 