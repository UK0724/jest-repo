import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin } from './utils/firebaseUtils';

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Simple test function
async function testEmulator() {
  try {
    console.log('Testing Firestore emulator...');
    
    // Try to write to Firestore
    const testRef = await admin.firestore().collection('test').add({
      test: 'Hello from test',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('Successfully wrote to Firestore. Document ID:', testRef.id);
    
    // Try to read from Firestore
    const doc = await testRef.get();
    console.log('Successfully read from Firestore. Data:', doc.data());
    
    console.log('Firestore emulator is working correctly!');
  } catch (error) {
    console.error('Error testing emulator:', error);
  }
}

// Run the test
testEmulator(); 