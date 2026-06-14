// Interface para o Background Sync API
interface SyncManager {
    getTags(): Promise<string[]>;
    register(tag: string): Promise<void>;
}

// Extende a interface global do ServiceWorkerRegistration
interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
}

// Extende a interface global do Window para reconhecer o SyncManager
interface Window {
    SyncManager: SyncManager;
}