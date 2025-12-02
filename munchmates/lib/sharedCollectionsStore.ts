// lib/sharedCollectionsStore.ts
// Shared store for recipe collections with file-based persistence
import fs from 'fs';
import path from 'path';

export type SharedRecipe = {
    recipeId: number;
    recipeName: string;
    addedBy: string;
    addedByName: string;
    addedAt: string;
};

export type CollectionMember = {
    userId: string;
    userName: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: string;
};

export type SharedCollection = {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    members: CollectionMember[];
    recipes: SharedRecipe[];
};

// File path for persistent storage
const DATA_DIR = path.join(process.cwd(), 'data');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'shared-collections.json');

// Ensure data directory exists
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Load collections from file
function loadCollections(): Map<string, SharedCollection> {
    try {
        ensureDataDir();
        if (fs.existsSync(COLLECTIONS_FILE)) {
            const data = fs.readFileSync(COLLECTIONS_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            return new Map(Object.entries(parsed));
        }
    } catch (error) {
        console.error('Error loading collections from file:', error);
    }
    return new Map();
}

// Save collections to file
function saveCollections(collections: Map<string, SharedCollection>) {
    try {
        ensureDataDir();
        const data = Object.fromEntries(collections);
        fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving collections to file:', error);
    }
}

// Initialize collections from persistent storage
const _collections = loadCollections();

// Create a proxy to automatically save on modifications
export const sharedCollections = {
    get(key: string): SharedCollection | undefined {
        return _collections.get(key);
    },
    set(key: string, value: SharedCollection): Map<string, SharedCollection> {
        const result = _collections.set(key, value);
        saveCollections(_collections);
        return result;
    },
    delete(key: string): boolean {
        const result = _collections.delete(key);
        saveCollections(_collections);
        return result;
    },
    has(key: string): boolean {
        return _collections.has(key);
    },
    forEach(callback: (value: SharedCollection, key: string, map: Map<string, SharedCollection>) => void) {
        _collections.forEach(callback);
    },
    get size(): number {
        return _collections.size;
    },
    values(): IterableIterator<SharedCollection> {
        return _collections.values();
    },
    keys(): IterableIterator<string> {
        return _collections.keys();
    },
    entries(): IterableIterator<[string, SharedCollection]> {
        return _collections.entries();
    },
};

// Helper to generate unique IDs
export function generateCollectionId(): string {
    return `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
