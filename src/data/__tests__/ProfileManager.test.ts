import { ProfileManager } from '../ProfileManager';
import { DatabaseManager } from '../Database';

// Mock the database
jest.mock('../Database');

describe('ProfileManager', () => {
  let profileManager: ProfileManager;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn(() => ({
        run: jest.fn(),
        get: jest.fn(),
        all: jest.fn(() => []),
      })),
    };
    
    (DatabaseManager.getInstance as jest.Mock).mockReturnValue({
      getDatabase: () => mockDb,
    });
    
    profileManager = new ProfileManager();
  });

  describe('createProfile', () => {
    it('should create a new profile', async () => {
      const mockRun = jest.fn();
      const mockGet = jest.fn().mockReturnValue({ count: 1 });
      
      mockDb.prepare.mockImplementation((sql: string) => {
        if (sql.includes('INSERT INTO profiles')) {
          return { run: mockRun };
        }
        if (sql.includes('COUNT(*)')) {
          return { get: mockGet };
        }
        return { run: jest.fn() };
      });

      const profile = await profileManager.createProfile('TestUser');
      
      expect(profile.name).toBe('TestUser');
      expect(profile.id).toBeDefined();
      expect(mockRun).toHaveBeenCalled();
    });

    it('should throw error for duplicate profile name', async () => {
      const mockRun = jest.fn().mockImplementation(() => {
        const error = new Error('UNIQUE constraint failed');
        error.message = 'UNIQUE constraint failed';
        throw error;
      });
      
      mockDb.prepare.mockReturnValue({ run: mockRun });

      await expect(profileManager.createProfile('Duplicate')).rejects.toThrow(
        "Profile 'Duplicate' already exists"
      );
    });
  });

  describe('getProfileByName', () => {
    it('should return profile if found', async () => {
      const mockProfile = {
        id: 'test-id',
        name: 'TestUser',
        created_at: new Date().toISOString(),
        best_wpm: 60,
        best_accuracy: 95,
        tests_completed: 5,
        total_time_typed: 300,
      };

      mockDb.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(mockProfile) });

      const profile = await profileManager.getProfileByName('TestUser');
      
      expect(profile).toBeDefined();
      expect(profile?.name).toBe('TestUser');
      expect(profile?.bestWpm).toBe(60);
    });

    it('should return null if profile not found', async () => {
      mockDb.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(undefined) });

      const profile = await profileManager.getProfileByName('NonExistent');
      
      expect(profile).toBeNull();
    });
  });

  describe('updateProfileStats', () => {
    it('should update profile statistics', async () => {
      const mockRun = jest.fn();
      mockDb.prepare.mockReturnValue({ run: mockRun });

      await profileManager.updateProfileStats('test-id', {
        wpm: 70,
        accuracy: 98,
        testsCompleted: 1,
        totalTimeTyped: 60,
      });

      expect(mockRun).toHaveBeenCalled();
    });
  });
});