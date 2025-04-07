import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin, createTestRequest } from '../utils/firebaseUtils';

// =============================================
// TEMPLATE FOR CREATING NEW FIREBASE FUNCTIONS
// =============================================
// To use this template:
// 1. Copy this file to a new file in the src/functions directory
// 2. Rename the file to match your function (e.g., orderFunctions.ts)
// 3. Update the interface, function name, and implementation
// 4. Create a corresponding test file in src/functions/__tests__
// =============================================

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Define interfaces for the function
interface YourDataInterface {
  // Add your data properties here
  field1: string;
  field2: number;
  userId: string; // Include userId if the function is user-specific
}

// Define the function implementation
const yourFunctionImplementation = async (request: any) => {
  // Authentication check
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // Extract data from request
  const { field1, field2, userId } = request.data as YourDataInterface;

  // User permission check (if applicable)
  if (request.auth.uid !== userId) {
    throw new HttpsError(
      'permission-denied',
      'You can only perform this action for your own user account.'
    );
  }

  try {
    console.log('Starting operation...');
    
    // Your function logic here
    // Example: Store data in Firestore
    const docRef = await admin.firestore().collection('your-collection').add({
      field1,
      field2,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('Operation completed with ID:', docRef.id);

    // Return the result
    return {
      id: docRef.id,
      field1,
      field2,
      userId,
    };
  } catch (error) {
    console.error('Error in operation:', error);
    throw new HttpsError(
      'internal',
      'An error occurred while processing your request.'
    );
  }
};

// Export the function wrapped with onCall
export const yourFunction = onCall({ cors: true }, yourFunctionImplementation);

// For local testing with ts-node
if (require.main === module) {
  // This code will only run when the file is executed directly
  console.log('Running in local development mode');
  
  // Test the function
  const testRequest = createTestRequest({
    field1: 'Test Value',
    field2: 42,
    userId: 'test-user-id',
  });
  
  // Create a wrapper function to simulate the onCall behavior
  const testFunction = async () => {
    try {
      const result = await yourFunctionImplementation(testRequest);
      console.log('Success:', result);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Error:', error);
      }
    }
  };
  
  testFunction();
} 