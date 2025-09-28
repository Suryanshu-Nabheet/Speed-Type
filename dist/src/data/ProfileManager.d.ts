import { Profile } from '../core/types';
export declare class ProfileManager {
    private db;
    createProfile(name: string): Promise<Profile>;
    getProfileByName(name: string): Promise<Profile | null>;
    getProfileById(id: string): Promise<Profile | null>;
    getAllProfiles(): Promise<Profile[]>;
    deleteProfile(name: string): Promise<void>;
    switchProfile(name: string): Promise<void>;
    getCurrentProfile(): Promise<Profile | null>;
    updateProfileStats(profileId: string, stats: {
        wpm?: number;
        accuracy?: number;
        testsCompleted?: number;
        totalTimeTyped?: number;
    }): Promise<void>;
    private setCurrentProfile;
    private mapRowToProfile;
}
//# sourceMappingURL=ProfileManager.d.ts.map