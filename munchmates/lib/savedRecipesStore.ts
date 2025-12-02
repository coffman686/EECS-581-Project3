// lib/savedRecipesStore.ts
// Persistent store for saved recipes with file-based storage
import fs from 'fs';
import path from 'path';

export type SavedRecipe = {
    userId: string;
    recipeId: number;
    recipeName: string;
    savedAt: string;
};

// File path for persistent storage
const DATA_DIR = path.join(process.cwd(), 'data');
const SAVED_RECIPES_FILE = path.join(DATA_DIR, 'saved-recipes.json');

// Ensure data directory exists
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Load saved recipes from file
function loadSavedRecipes(): Map<string, SavedRecipe[]> {
    try {
        ensureDataDir();
        if (fs.existsSync(SAVED_RECIPES_FILE)) {
            const data = fs.readFileSync(SAVED_RECIPES_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            return new Map(Object.entries(parsed));
        }
    } catch (error) {
        console.error('Error loading saved recipes from file:', error);
    }
    return new Map();
}

// Save recipes to file
function saveToFile(recipes: Map<string, SavedRecipe[]>) {
    try {
        ensureDataDir();
        const data = Object.fromEntries(recipes);
        fs.writeFileSync(SAVED_RECIPES_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving recipes to file:', error);
    }
}

// Initialize from persistent storage
const _savedRecipes = loadSavedRecipes();

// Create a proxy to automatically save on modifications
export const savedRecipesStore = {
    get(userId: string): SavedRecipe[] {
        return _savedRecipes.get(userId) || [];
    },
    set(userId: string, recipes: SavedRecipe[]): void {
        _savedRecipes.set(userId, recipes);
        saveToFile(_savedRecipes);
    },
    has(userId: string): boolean {
        return _savedRecipes.has(userId);
    },
    addRecipe(userId: string, recipe: SavedRecipe): void {
        const userRecipes = this.get(userId);
        userRecipes.push(recipe);
        this.set(userId, userRecipes);
    },
    removeRecipe(userId: string, recipeId: number): boolean {
        const userRecipes = this.get(userId);
        const index = userRecipes.findIndex(r => r.recipeId === recipeId);
        if (index === -1) return false;
        userRecipes.splice(index, 1);
        this.set(userId, userRecipes);
        return true;
    },
    hasRecipe(userId: string, recipeId: number): boolean {
        const userRecipes = this.get(userId);
        return userRecipes.some(r => r.recipeId === recipeId);
    },
};
