"use client";

import { useState, useEffect } from "react";
import { ChefHat, Clock, Users, Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authedFetch } from "@/lib/authedFetch";
import { useRouter } from "next/navigation";

type RecipeDetailsProps = {
    recipeId: string | null;
    onClose?: () => void;
};

interface RecipeInfo {
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    summary: string;
    diets: string[];
    dishTypes: string[];
    extendedIngredients: Array<{
        id: number;
        original: string;
        name: string;
        amount: number;
        unit: string;
    }>;
    analyzedInstructions: Array<{
        name: string;
        steps: Array<{
            number: number;
            step: string;
        }>;
    }>;
}

export default function RecipeDetails({ recipeId, onClose }: RecipeDetailsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [recipe, setRecipe] = useState<RecipeInfo | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (recipeId) {
            fetchRecipeDetails();
            checkIfSaved();
        }
    }, [recipeId]);

    const fetchRecipeDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/spoonacular/recipes/information?id=${recipeId}`);
            const data = await response.json();
            
            if (!response.ok) {
                // Check for specific error messages
                if (response.status === 402 || data.error?.includes('limit')) {
                    throw new Error("API daily limit reached. Please try again tomorrow.");
                }
                throw new Error(data.error || "Failed to fetch recipe details");
            }
            
            setRecipe(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const checkIfSaved = async () => {
        try {
            const response = await authedFetch("/api/recipes/saved");
            if (response.ok) {
                const data = await response.json();
                const savedRecipes = data.recipes || [];
                setIsSaved(savedRecipes.some((r: any) => String(r.recipeId) === String(recipeId)));
            }
        } catch (err) {
            console.error("Error checking saved status:", err);
        }
    };

    const handleSaveToggle = async () => {
        if (!recipe) return;

        try {
            if (isSaved) {
                const response = await authedFetch(`/api/recipes/saved?recipeId=${recipe.id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    setIsSaved(false);
                }
            } else {
                const response = await authedFetch("/api/recipes/saved", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        recipeId: recipe.id,
                        recipeName: recipe.title,
                    }),
                });
                if (response.ok) {
                    setIsSaved(true);
                }
            }
        } catch (err) {
            console.error("Error toggling save:", err);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    // Strip HTML tags from summary
    const stripHtml = (html: string) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold mb-2">Loading recipe...</h3>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <h3 className="text-lg font-semibold mb-2 text-destructive">
                    {error || "Recipe not found"}
                </h3>
                <Button variant="outline" onClick={handleClose}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-h-[100vh] overflow-y-auto">
            {/* Header with back button */}
            <div className="sticky top-0 bg-background z-10 flex items-center gap-3 p-4 border-b">
                <Button variant="ghost" size="sm" onClick={handleClose} className="flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <h2 className="text-lg font-bold truncate flex-1">{recipe.title}</h2>
            </div>

            {/* Recipe Image */}
            {recipe.image && (
                <div className="relative w-full h-48">
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-4 space-y-6">
                {/* Quick Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.readyInMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings} servings</span>
                    </div>
                </div>

                {/* Diet Tags */}
                {recipe.diets && recipe.diets.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {recipe.diets.map((diet) => (
                            <Badge key={diet} variant="secondary">
                                {diet}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Save Button */}
                <Button
                    onClick={handleSaveToggle}
                    variant={isSaved ? "secondary" : "default"}
                    className="w-full"
                >
                    {isSaved ? (
                        <>
                            <BookmarkCheck className="h-4 w-4 mr-2" />
                            Saved
                        </>
                    ) : (
                        <>
                            <Bookmark className="h-4 w-4 mr-2" />
                            Save Recipe
                        </>
                    )}
                </Button>

                {/* Summary */}
                {recipe.summary && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">About</h3>
                        <p className="text-sm text-muted-foreground">
                            {stripHtml(recipe.summary).substring(0, 300)}...
                        </p>
                    </div>
                )}

                {/* Ingredients */}
                {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                        <ul className="space-y-2">
                            {recipe.extendedIngredients.map((ingredient, index) => (
                                <li key={`${ingredient.id}-${index}`} className="flex items-start gap-2 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span>{ingredient.original}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Instructions */}
                {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                        <ol className="space-y-4">
                            {recipe.analyzedInstructions[0]?.steps.map((step) => (
                                <li key={step.number} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                        {step.number}
                                    </span>
                                    <p className="text-sm pt-0.5">{step.step}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}