import { Config } from '../core/types';
export declare class ConfigManager {
    private db;
    private cache;
    constructor();
    get<T = string>(key: string, defaultValue?: T): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    getAll(): Promise<Record<string, any>>;
    getConfig(): Promise<Partial<Config>>;
    updateConfig(updates: Partial<Config>): Promise<void>;
    private loadCache;
    private serializeValue;
    private deserializeValue;
}
//# sourceMappingURL=ConfigManager.d.ts.map