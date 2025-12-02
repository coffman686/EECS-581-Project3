'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Clock, Users, ChefHat, Heart, ArrowLeft, Trash2, FolderHeart, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Same localStorage key as recipes page
const SAVED_RECIPES_STORAGE_KEY = 'saved-recipes';

type SavedRecipe = {
    recipeId: number;
    recipeName: string;
    recipeImage?: string;
    savedAt: string;
};

type SharedCollection = {
    id: string;
    name: string;
    description: string;
};

const SavedRecipesPage = () => {
    const router = useRouter();
    const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [collections, setCollections] = useState<SharedCollection[]>([]);
    const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
    const [isAddingToCollection, setIsAddingToCollection] = useState(false);

    // Load saved recipes and collections on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [recipesRes, collectionsRes] = await Promise.all([
                    authedFetch('/api/recipes/saved'),
                    authedFetch('/api/shared-collections'),
                ]);
                
                if (recipesRes.ok) {
                    const data = await recipesRes.json();
                    setSavedRecipes(data.recipes || []);
                }
                
                if (collectionsRes.ok) {
                    const data = await collectionsRes.json();
                    setCollections(data.collections || []);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Save to localStorage whenever savedRecipes changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(SAVED_RECIPES_STORAGE_KEY, JSON.stringify(savedRecipes));
        }
    }, [savedRecipes, isLoaded]);

    const handleRemoveSavedRecipe = (recipeId: number) => {
        setSavedRecipes(prev => prev.filter(r => r.recipeId !== recipeId));
    };

    const openAddToCollectionDialog = (recipe: SavedRecipe) => {
        setSelectedRecipe(recipe);
        setSelectedCollectionId('');
        setIsAddToCollectionOpen(true);
    };

    const handleAddToCollection = async () => {
        if (!selectedRecipe || !selectedCollectionId) return;

        setIsAddingToCollection(true);
        try {
            const response = await authedFetch(`/api/shared-collections/${selectedCollectionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addRecipe',
                    recipeId: selectedRecipe.recipeId,
                    recipeName: selectedRecipe.recipeName,
                }),
            });

            if (response.ok) {
                alert(`"${selectedRecipe.recipeName}" has been added to the collection!`);
                setIsAddToCollectionOpen(false);
            } else {
                const error = await response.json();
                alert(error.error || error.message || 'Failed to add recipe to collection');
            }
        } catch (error) {
            console.error('Error adding to collection:', error);
            alert('Failed to add recipe to collection. Please try again.');
        } finally {
            setIsAddingToCollection(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title="Saved Recipes" />
                        <main className="flex-1 p-6">
                            <div className="max-w-6xl mx-auto">
                                {/* Header */}
                                <div className="mb-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/recipes')}
                                        className="mb-4"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Recipes
                                    </Button>
                                    <h1 className="text-3xl font-bold flex items-center gap-3">
                                        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                                        Saved Recipes
                                    </h1>
                                    <p className="text-muted-foreground mt-2">
                                        Your collection of favorite recipes
                                    </p>
                                </div>

                                {/* Content */}
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <ChefHat className="h-12 w-12 text-muted-foreground animate-spin" />
                                    </div>
                                ) : savedRecipes.length === 0 ? (
                                    <Card className="text-center py-12">
                                        <CardContent>
                                            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold mb-2">No saved recipes yet</h3>
                                            <p className="text-muted-foreground mb-6">
                                                Start exploring recipes and save your favorites!
                                            </p>
                                            <Button onClick={() => router.push('/recipes')}>
                                                Browse Recipes
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {savedRecipes.map((recipe) => (
                                            <Card key={recipe.recipeId} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                                {/* Recipe Image */}
                                                <div className="h-48 bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                                                    {recipe.recipeImage ? (
                                                        <img
                                                            src={recipe.recipeImage}
                                                            alt={recipe.recipeName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ChefHat className="h-16 w-16 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="line-clamp-2 text-lg">
                                                        {recipe.recipeName}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 pt-0">
                                                    <p className="text-sm text-muted-foreground">
                                                        Saved on {formatDate(recipe.savedAt)}
                                                    </p>
                                                </CardContent>
                                                <CardFooter className="flex gap-2">
                                                    <Button
                                                        variant="default"
                                                        className="flex-1"
                                                        onClick={() => router.push(`/recipes/${recipe.recipeId}`)}
                                                    >
                                                        View Recipe
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openAddToCollectionDialog(recipe)}
                                                        title="Add to shared collection"
                                                    >
                                                        <FolderHeart className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleRemoveSavedRecipe(recipe.recipeId)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add to Collection Dialog */}
                            <Dialog open={isAddToCollectionOpen} onOpenChange={setIsAddToCollectionOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add to Shared Collection</DialogTitle>
                                        <DialogDescription>
                                            {selectedRecipe && (
                                                <>Add &quot;{selectedRecipe.recipeName}&quot; to a shared collection.</>
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        {collections.length === 0 ? (
                                            <div className="text-center py-4">
                                                <FolderHeart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    You don&apos;t have any shared collections yet.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsAddToCollectionOpen(false);
                                                        router.push('/shared-collections');
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create a Collection
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Select Collection
                                                </label>
                                                <Select
                                                    value={selectedCollectionId}
                                                    onValueChange={setSelectedCollectionId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a collection" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {collections.map((collection) => (
                                                            <SelectItem key={collection.id} value={collection.id}>
                                                                {collection.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsAddToCollectionOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        {collections.length > 0 && (
                                            <Button
                                                onClick={handleAddToCollection}
                                                disabled={!selectedCollectionId || isAddingToCollection}
                                            >
                                                {isAddingToCollection ? 'Adding...' : 'Add to Collection'}
                                            </Button>
                                        )}
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    );
};

export default SavedRecipesPage;
