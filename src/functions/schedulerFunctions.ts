import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

export const cleanupOldUsers = onSchedule('0 0 * * *', async (event) => {
  const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  try {
    const snapshot = await admin
      .firestore()
      .collection('users')
      .where('lastLogin', '<', thirtyDaysAgo)
      .get();

    const batch = admin.firestore().batch();
    const deletePromises = snapshot.docs.map(async (doc) => {
      // Delete user from Auth
      await admin.auth().deleteUser(doc.id);
      // Add to batch for Firestore deletion
      batch.delete(doc.ref);
    });

    await Promise.all(deletePromises);
    await batch.commit();

    console.log(`Successfully cleaned up ${snapshot.size} inactive users`);
  } catch (error) {
    console.error('Error cleaning up old users:', error);
    throw error;
  }
}); 