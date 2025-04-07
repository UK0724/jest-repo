import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin } from './utils/firebaseUtils';

interface UserData {
  name: string;
  email: string;
}

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Define the function implementation
const createUserImplementation = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { name, email } = request.data as UserData;

  try {
    console.log('Creating user in Auth emulator...');
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      displayName: name,
    });
    console.log('User created in Auth:', userRecord.uid);

    console.log('Storing user data in Firestore emulator...');
    // Store additional user data in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('User data stored in Firestore');

    return {
      uid: userRecord.uid,
      name: userRecord.displayName,
      email: userRecord.email,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new HttpsError(
      'internal',
      'An error occurred while creating the user.'
    );
  }
};

// Export the function wrapped with onCall
export const createUser = onCall({ cors: true }, createUserImplementation);

// For local testing with ts-node
if (require.main === module) {
  // This code will only run when the file is executed directly
  console.log('Running in local development mode');
  
  // Test the function
  const testRequest = {
    auth: {
      uid: 'test-uid',
      token: 'test-token',
    },
    data: {
      name: 'Test User',
      email: 'test@example.com',
    },
  };
  
  // Create a wrapper function to simulate the onCall behavior
  const testFunction = async () => {
    try {
      const result = await createUserImplementation(testRequest);
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
