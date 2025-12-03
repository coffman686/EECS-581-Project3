// File: RecipeDetailPage
// Purpose: Render the full details for a specific recipe ID
// Inputs: recipeId extracted from the URL path
// Outputs: Full recipe view including metadata, ingredients, and instructions
// Fetches recipe information, instructions, and saved-status
// Allows user to save/unsave recipes
// Handles redirect if route matches /recipes/saved

"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";
import AppHeader from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authedFetch } from "@/lib/authedFetch";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Heart,
  Leaf,
  Wheat,
  Milk,
  Star,
  CheckCircle2,
  UtensilsCrossed,
} from "lucide-react";

type RecipeInfo = {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  spoonacularScore?: number;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  vegan?: boolean;
  vegetarian?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  veryHealthy?: boolean;
  cheap?: boolean;
  summary?: string;
  instructions?: string;
  extendedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
};

type InstructionStep = {
  number: number;
  step: string;
  ingredients?: Array<{ id: number; name: string; image: string }>;
  equipment?: Array<{ id: number; name: string; image: string }>;
};

const RecipeDetailPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const recipeId = pathname.split("/").pop();

  const [recipe, setRecipe] = useState<RecipeInfo | null>(null);
  const [instructions, setInstructions] = useState<InstructionStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeData = async () => {
      if (!recipeId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch recipe information and instructions in parallel
        const [infoRes, instructionsRes, savedRes] = await Promise.all([
          fetch(`/api/spoonacular/recipes/information?id=${recipeId}`),
          fetch(`/api/spoonacular/recipes/searchRecipeInstructions?id=${recipeId}`),
          authedFetch("/api/recipes/saved"),
        ]);

        if (infoRes.ok) {
          const infoData = await infoRes.json();
          setRecipe(infoData);
        } else {
          setError("Failed to load recipe information");
        }

        if (instructionsRes.ok) {
          const instructionsData = await instructionsRes.json();
          // Instructions come as an array of instruction groups
          if (instructionsData.instructions && instructionsData.instructions.length > 0) {
            setInstructions(instructionsData.instructions[0]?.steps || []);
          }
        }

        if (savedRes.ok) {
          const savedData = await savedRes.json();
          const savedIds = new Set(savedData.recipes.map((r: any) => r.recipeId));
          setIsSaved(savedIds.has(parseInt(recipeId)));
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeData();
  }, [recipeId]);

  const handleSaveRecipe = async () => {
    if (!recipe) return;

    try {
      if (isSaved) {
        await authedFetch(`/api/recipes/saved?recipeId=${recipe.id}`, {
          method: "DELETE",
        });
        setIsSaved(false);
      } else {
        await authedFetch("/api/recipes/saved", {
          method: "POST",
          body: JSON.stringify({
            recipeId: recipe.id,
            recipeName: recipe.title,
          }),
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
    }
  };

  // Strip HTML tags from summary
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  // Handle static routes that might be caught by this dynamic route
  useEffect(() => {
    if (recipeId === "saved") {
      window.location.href = "/recipes/saved";
    }
  }, [recipeId]);

  // Don't render if this is actually the saved route
  if (!recipeId || recipeId === "saved") {
    return null;
  }

  return (
    <RequireAuth>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <AppHeader title="Recipe Details" />
            <main className="flex-1 p-6 bg-muted/20">
              <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ChefHat className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading recipe...</p>
                  </div>
                ) : error ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{error}</h3>
                      <Button onClick={() => router.back()}>Go Back</Button>
                    </CardContent>
                  </Card>
                ) : recipe ? (
                  <div className="space-y-6">
                    {/* Recipe Header */}
                    <Card>
                      <div className="md:flex">
                        {recipe.image && (
                          <div className="md:w-1/3">
                            <img
                              src={recipe.image}
                              alt={recipe.title}
                              className="w-full h-64 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h1 className="text-2xl font-bold">{recipe.title}</h1>
                            <Button
                              variant={isSaved ? "default" : "outline"}
                              size="icon"
                              onClick={handleSaveRecipe}
                            >
                              <Heart
                                className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`}
                              />
                            </Button>
                          </div>

                          {/* Quick Info */}
                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                            {recipe.readyInMinutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{recipe.readyInMinutes} min</span>
                              </div>
                            )}
                            {recipe.servings && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{recipe.servings} servings</span>
                              </div>
                            )}
                            {recipe.spoonacularScore && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{Math.round(recipe.spoonacularScore)}</span>
                              </div>
                            )}
                          </div>

                          {/* Diet Badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {recipe.vegan && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Leaf className="h-3 w-3" /> Vegan
                              </Badge>
                            )}
                            {recipe.vegetarian && !recipe.vegan && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Leaf className="h-3 w-3" /> Vegetarian
                              </Badge>
                            )}
                            {recipe.glutenFree && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Wheat className="h-3 w-3" /> Gluten-Free
                              </Badge>
                            )}
                            {recipe.dairyFree && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Milk className="h-3 w-3" /> Dairy-Free
                              </Badge>
                            )}
                            {recipe.veryHealthy && (
                              <Badge variant="default" className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Very Healthy
                              </Badge>
                            )}
                          </div>

                          {/* Cuisines & Dish Types */}
                          <div className="flex flex-wrap gap-2">
                            {recipe.cuisines?.map((cuisine) => (
                              <Badge key={cuisine} variant="outline">
                                {cuisine}
                              </Badge>
                            ))}
                            {recipe.dishTypes?.map((type) => (
                              <Badge key={type} variant="outline">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Summary */}
                    {recipe.summary && (
                      <Card>
                        <CardHeader>
                          <CardTitle>About This Recipe</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed">
                            {stripHtml(recipe.summary)}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Ingredients */}
                    {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <UtensilsCrossed className="h-5 w-5" />
                            Ingredients
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {recipe.extendedIngredients.map((ingredient, index) => (
                              <li
                                key={`${ingredient.id}-${index}`}
                                className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>{ingredient.original}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Instructions */}
                    {instructions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5" />
                            Instructions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="space-y-4">
                            {instructions.map((step) => (
                              <li key={step.number} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                                  {step.number}
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="text-foreground">{step.step}</p>
                                </div>
                              </li>
                            ))}
                          </ol>
                        </CardContent>
                      </Card>
                    )}

                    {/* Fallback if no structured instructions */}
                    {instructions.length === 0 && recipe.instructions && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5" />
                            Instructions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-line text-foreground">
                            {stripHtml(recipe.instructions)}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : null}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
};

export default RecipeDetailPage;