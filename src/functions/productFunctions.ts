import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin, createTestRequest } from './utils/firebaseUtils';

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Define interfaces for the function
interface ProductData {
  name: string;
  description: string;
  price: number;
  userId: string;
}

// Define the function implementation
const createProductImplementation = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { name, description, price, userId } = request.data as ProductData;

  // Validate that the authenticated user is creating a product for themselves
  if (request.auth.uid !== userId) {
    throw new HttpsError(
      'permission-denied',
      'You can only create products for your own user account.'
    );
  }

  try {
    console.log('Creating product in Firestore...');
    
    // Store product data in Firestore
    const productRef = await admin.firestore().collection('products').add({
      name,
      description,
      price,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('Product created with ID:', productRef.id);

    return {
      id: productRef.id,
      name,
      description,
      price,
      userId,
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw new HttpsError(
      'internal',
      'An error occurred while creating the product.'
    );
  }
};

// Export the function wrapped with onCall
export const createProduct = onCall({ cors: true }, createProductImplementation);

// For local testing with ts-node
if (require.main === module) {
  // This code will only run when the file is executed directly
  console.log('Running in local development mode');
  
  // Test the function
  const testRequest = createTestRequest({
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    userId: 'test-user-id',
  });
  
  // Create a wrapper function to simulate the onCall behavior
  const testFunction = async () => {
    try {
      const result = await createProductImplementation(testRequest);
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