import { useState, useEffect } from "react";
import { ChefHat, Clock, Users, Leaf, Heart, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type RecipeDetailsProps = {
    recipeId: string | null;
};

type RecipeInfo = {
    id: number;
    title: string;
    image?: string;
    readyInMinutes?: number;
    servings?: number;
    cuisines?: string[];
    dishTypes?: string[];
    diets?: string[];
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    healthScore?: number;
    summary?: string;
    instructions?: string;
    extendedIngredients?: {
        id: number;
        name: string;
        amount: number;
        unit: string;
        original: string;
    }[];
};

type InstructionStep = {
    number: number;
    step: string;
    ingredients?: { id: number; name: string; image: string }[];
    equipment?: { id: number; name: string; image: string }[];
};

type AnalyzedInstruction = {
    name: string;
    steps: InstructionStep[];
};

export default function RecipeDetails({ recipeId }: RecipeDetailsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [recipeInfo, setRecipeInfo] = useState<RecipeInfo | null>(null);
    const [instructions, setInstructions] = useState<AnalyzedInstruction[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!recipeId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch both recipe info and instructions in parallel
                const [infoResponse, instructionsResponse] = await Promise.all([
                    fetch(`/api/spoonacular/recipes/info?id=${recipeId}`),
                    fetch(`/api/spoonacular/recipes/searchRecipeInstructions?id=${recipeId}`)
                ]);

                if (!infoResponse.ok) {
                    throw new Error('Failed to fetch recipe information');
                }

                const infoData = await infoResponse.json();
                setRecipeInfo(infoData);

                if (instructionsResponse.ok) {
                    const instructionsData = await instructionsResponse.json();
                    setInstructions(instructionsData.instructions || []);
                }
            } catch (err) {
                console.error('Error fetching recipe:', err);
                setError('Failed to load recipe details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [recipeId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <ChefHat className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
                <h3 className="text-lg font-semibold">Loading recipe...</h3>
            </div>
        );
    }

    if (error || !recipeInfo) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-500">{error || 'Recipe not found'}</h3>
            </div>
        );
    }

    // Clean HTML from summary
    const cleanSummary = recipeInfo.summary?.replace(/<[^>]*>/g, '') || '';

    return (
        <div className="space-y-6 p-4">
            {/* Recipe Image */}
            {recipeInfo.image && (
                <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                    <img
                        src={recipeInfo.image}
                        alt={recipeInfo.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold">{recipeInfo.title}</h1>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {recipeInfo.readyInMinutes && (
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipeInfo.readyInMinutes} min</span>
                    </div>
                )}
                {recipeInfo.servings && (
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recipeInfo.servings} servings</span>
                    </div>
                )}
                {recipeInfo.healthScore && (
                    <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>Health Score: {recipeInfo.healthScore}</span>
                    </div>
                )}
            </div>

            {/* Diet Badges */}
            <div className="flex flex-wrap gap-2">
                {recipeInfo.vegetarian && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Leaf className="h-3 w-3 mr-1" />
                        Vegetarian
                    </Badge>
                )}
                {recipeInfo.vegan && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Leaf className="h-3 w-3 mr-1" />
                        Vegan
                    </Badge>
                )}
                {recipeInfo.glutenFree && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Gluten-Free
                    </Badge>
                )}
                {recipeInfo.dairyFree && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Dairy-Free
                    </Badge>
                )}
                {recipeInfo.cuisines?.map(cuisine => (
                    <Badge key={cuisine} variant="outline">
                        {cuisine}
                    </Badge>
                ))}
                {recipeInfo.dishTypes?.slice(0, 3).map(type => (
                    <Badge key={type} variant="outline">
                        {type}
                    </Badge>
                ))}
            </div>

            {/* Summary */}
            {cleanSummary && (
                <>
                    <Separator />
                    <div>
                        <h2 className="text-lg font-semibold mb-2">About</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {cleanSummary.length > 300
                                ? cleanSummary.substring(0, 300) + '...'
                                : cleanSummary}
                        </p>
                    </div>
                </>
            )}

            {/* Ingredients */}
            {recipeInfo.extendedIngredients && recipeInfo.extendedIngredients.length > 0 && (
                <>
                    <Separator />
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Ingredients</h2>
                        <ul className="space-y-2">
                            {recipeInfo.extendedIngredients.map((ingredient, index) => (
                                <li
                                    key={ingredient.id || index}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <span className="text-primary font-medium">•</span>
                                    <span>{ingredient.original || `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            {/* Instructions */}
            {instructions.length > 0 && (
                <>
                    <Separator />
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Instructions</h2>
                        <ol className="space-y-4">
                            {instructions.flatMap(instruction =>
                                instruction.steps.map(step => (
                                    <li key={step.number} className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                                            {step.number}
                                        </span>
                                        <p className="text-sm leading-relaxed pt-0.5">{step.step}</p>
                                    </li>
                                ))
                            )}
                        </ol>
                    </div>
                </>
            )}

            {/* Fallback: HTML Instructions if no analyzed instructions */}
            {instructions.length === 0 && recipeInfo.instructions && (
                <>
                    <Separator />
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Instructions</h2>
                        <div
                            className="text-sm leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: recipeInfo.instructions }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}