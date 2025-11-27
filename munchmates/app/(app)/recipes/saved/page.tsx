'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { authedFetch } from '@/lib/authedFetch';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, ChefHat, Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type SavedRecipe = {
    recipeId: number;
    recipeName: string;
    savedAt: string;
};

const SavedRecipesPage = () => {
    const router = useRouter();
    const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved recipes on mount
    useEffect(() => {
        const loadSavedRecipes = async () => {
            setIsLoading(true);
            try {
                const response = await authedFetch('/api/recipes/saved');
                if (response.ok) {
                    const data = await response.json();
                    setSavedRecipes(data.recipes || []);
                }
            } catch (error) {
                console.error('Error loading saved recipes:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSavedRecipes();
    }, []);

    const handleRemoveSavedRecipe = async (recipeId: number) => {
        try {
            const response = await authedFetch(`/api/recipes/saved?recipeId=${recipeId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove recipe');
            }

            // Update saved recipes state
            setSavedRecipes(prev => prev.filter(r => r.recipeId !== recipeId));
        } catch (error) {
            console.error('Error removing saved recipe:', error);
            alert('Failed to remove recipe. Please try again.');
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {savedRecipes.map((recipe) => (
                                            <Card key={recipe.recipeId} className="flex flex-col">
                                                <CardHeader>
                                                    <CardTitle className="line-clamp-2">
                                                        {recipe.recipeName}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1">
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
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    );
};

export default SavedRecipesPage;
