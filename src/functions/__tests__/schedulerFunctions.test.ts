import * as admin from 'firebase-admin';
import { cleanupOldUsers } from '../schedulerFunctions';

describe('Scheduler Functions', () => {
  let adminInitStub: jest.SpyInstance;

  beforeAll(() => {
    adminInitStub = jest.spyOn(admin, 'initializeApp').mockImplementation();
  });

  afterAll(() => {
    adminInitStub.mockRestore();
  });

  it('should clean up old users successfully', async () => {
    // Mock Firestore query
    const mockDocs = [
      { id: 'user1', ref: { delete: jest.fn() } },
      { id: 'user2', ref: { delete: jest.fn() } },
    ];
    
    const mockSnapshot = {
      docs: mockDocs,
      size: mockDocs.length,
    };

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockSnapshot),
    };

    jest.spyOn(admin.firestore(), 'collection')
      .mockReturnValue(mockQuery as any);

    // Mock batch operations
    const mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };

    jest.spyOn(admin.firestore(), 'batch')
      .mockReturnValue(mockBatch as any);

    // Mock Auth deleteUser
    const mockDeleteUser = jest.spyOn(admin.auth(), 'deleteUser')
      .mockResolvedValue(undefined);

    // Get the function handler directly
    const handler = cleanupOldUsers.run;
    await handler({
      scheduleTime: new Date().toISOString(),
      jobName: 'cleanup-users'
    });

    // Verify Firestore query
    expect(admin.firestore().collection).toHaveBeenCalledWith('users');
    expect(mockQuery.where).toHaveBeenCalled();
    expect(mockQuery.get).toHaveBeenCalled();

    // Verify batch operations
    expect(mockBatch.delete).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalled();

    // Verify Auth operations
    expect(mockDeleteUser).toHaveBeenCalledTimes(2);
    expect(mockDeleteUser).toHaveBeenCalledWith('user1');
    expect(mockDeleteUser).toHaveBeenCalledWith('user2');
  });

  it('should handle errors gracefully', async () => {
    // Mock Firestore query to throw an error
    jest.spyOn(admin.firestore(), 'collection')
      .mockImplementation(() => {
        throw new Error('Firestore error');
      });

    // Get the function handler directly
    const handler = cleanupOldUsers.run;
    await expect(handler({
      scheduleTime: new Date().toISOString(),
      jobName: 'cleanup-users'
    })).rejects.toThrow('Firestore error');
  });
}); 