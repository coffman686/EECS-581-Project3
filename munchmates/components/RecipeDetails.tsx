import { useState, useEffect } from "react";
import { ChefHat } from "lucide-react";

type RecipeDetailsProps = {
    recipeId: string | null;
};

export default function RecipeDetails({ recipeId }: RecipeDetailsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const fetchData = async () => {
        setIsLoading(true);
        const response = await fetch(`/api/spoonacular/recipes/searchRecipeInstructions?id=${recipeId}`);
        const results = await response.json();
        setData(results);
        setIsLoading(false);
    }
    useEffect(() => {
        if (recipeId) {
            fetchData();
        }
    }, [recipeId]);
    return (
        <div>
            {isLoading ? (
                <div>
                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">
                        Loading details...
                    </h3>
                </div>
            ) : (
                <div>
                    <h2>Recipe Instructions</h2>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}