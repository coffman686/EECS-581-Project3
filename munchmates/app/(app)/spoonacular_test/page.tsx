// test page for spoonacular API integration
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

type TestType = 'all' | 'recipes' | 'ingredients' | 'random' | 'byIngredients' | 'recipeInfo';

export default function SpoonacularTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (testType: TestType) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`/api/spoonacular/test?test=${testType}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Spoonacular API Test</h1>
        <p className="text-muted-foreground">
          Test your Spoonacular API integration. Make sure you have set up your
          API key in .env.local
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Tests</CardTitle>
          <CardDescription>
            Click any button below to test different Spoonacular API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => runTest('all')}
            disabled={loading}
            variant="default"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>
          <Button
            onClick={() => runTest('recipes')}
            disabled={loading}
            variant="outline"
          >
            Search Recipes
          </Button>
          <Button
            onClick={() => runTest('ingredients')}
            disabled={loading}
            variant="outline"
          >
            Search Ingredients
          </Button>
          <Button
            onClick={() => runTest('random')}
            disabled={loading}
            variant="outline"
          >
            Random Recipes
          </Button>
          <Button
            onClick={() => runTest('byIngredients')}
            disabled={loading}
            variant="outline"
          >
            Search by Ingredients
          </Button>
          <Button
            onClick={() => runTest('recipeInfo')}
            disabled={loading}
            variant="outline"
          >
            Recipe Details
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-8 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure your SPOONACULAR_API_KEY is set in .env.local and is
              valid.
            </p>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                API Key Configured:{' '}
                {results.apiKeyConfigured ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="destructive">No</Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Test Type: <strong>{results.testType}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Timestamp: {new Date(results.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {results.searchRecipes && (
            <Card>
              <CardHeader>
                <CardTitle>Search Recipes: "{results.searchRecipes.query}"</CardTitle>
                <CardDescription>
                  Found {results.searchRecipes.totalResults} total results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.searchRecipes.recipes.map((recipe: any) => (
                    <div
                      key={recipe.id}
                      className="border rounded-lg p-4 hover:bg-accent transition-colors"
                    >
                      {recipe.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-40 object-cover rounded-md mb-2"
                        />
                      )}
                      <h3 className="font-semibold mb-1">{recipe.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ready in: {recipe.readyInMinutes} min
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {recipe.id}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.searchIngredients && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Search Ingredients: "{results.searchIngredients.query}"
                </CardTitle>
                <CardDescription>
                  Found {results.searchIngredients.totalResults} total results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {results.searchIngredients.ingredients.map(
                    (ingredient: any) => (
                      <div
                        key={ingredient.id}
                        className="border rounded-lg p-3 text-center hover:bg-accent transition-colors"
                      >
                        {ingredient.imageUrl && (
                          <img
                            src={ingredient.imageUrl}
                            alt={ingredient.name}
                            className="w-20 h-20 object-cover rounded-md mx-auto mb-2"
                          />
                        )}
                        <p className="text-sm font-medium">{ingredient.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {ingredient.id}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {results.randomRecipes && (
            <Card>
              <CardHeader>
                <CardTitle>Random Recipes (Vegetarian)</CardTitle>
                <CardDescription>
                  {results.randomRecipes.count} random recipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.randomRecipes.recipes.map((recipe: any) => (
                    <div
                      key={recipe.id}
                      className="border rounded-lg p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex gap-4">
                        {recipe.image && (
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-32 h-32 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{recipe.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {recipe.vegetarian && (
                              <Badge variant="secondary">Vegetarian</Badge>
                            )}
                            {recipe.vegan && (
                              <Badge variant="secondary">Vegan</Badge>
                            )}
                            {recipe.glutenFree && (
                              <Badge variant="secondary">Gluten Free</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Ready in: {recipe.readyInMinutes} min | Servings:{' '}
                            {recipe.servings}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Health Score: {recipe.healthScore}/100
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.searchByIngredients && (
            <Card>
              <CardHeader>
                <CardTitle>Search by Ingredients</CardTitle>
                <CardDescription>
                  Recipes using: {results.searchByIngredients.ingredients}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.searchByIngredients.recipes.map((recipe: any) => (
                    <div
                      key={recipe.id}
                      className="border rounded-lg p-4 hover:bg-accent transition-colors"
                    >
                      {recipe.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-40 object-cover rounded-md mb-2"
                        />
                      )}
                      <h3 className="font-semibold">{recipe.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {recipe.id}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.recipeInformation && (
            <Card>
              <CardHeader>
                <CardTitle>{results.recipeInformation.title}</CardTitle>
                <CardDescription>
                  Detailed recipe information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <strong>Ready in:</strong>{' '}
                      {results.recipeInformation.readyInMinutes} minutes
                    </p>
                    <p>
                      <strong>Servings:</strong>{' '}
                      {results.recipeInformation.servings}
                    </p>
                    <p>
                      <strong>Health Score:</strong>{' '}
                      {results.recipeInformation.healthScore}/100
                    </p>
                    <p>
                      <strong>Ingredients:</strong>{' '}
                      {results.recipeInformation.ingredientsCount}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Dietary Info</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.recipeInformation.vegetarian && (
                      <Badge>Vegetarian</Badge>
                    )}
                    {results.recipeInformation.vegan && <Badge>Vegan</Badge>}
                    {results.recipeInformation.glutenFree && (
                      <Badge>Gluten Free</Badge>
                    )}
                    {results.recipeInformation.diets?.map((diet: string) => (
                      <Badge key={diet} variant="outline">
                        {diet}
                      </Badge>
                    ))}
                  </div>
                </div>

                {results.recipeInformation.cuisines?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Cuisines</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.recipeInformation.cuisines.map(
                        (cuisine: string) => (
                          <Badge key={cuisine} variant="secondary">
                            {cuisine}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {results.recipeInformation.ingredients?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Sample Ingredients (first 5)
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {results.recipeInformation.ingredients.map(
                        (ing: any, idx: number) => (
                          <li key={idx}>
                            {ing.amount} {ing.unit} {ing.name}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {results.recipeInformation.instructionsPreview && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Instructions Preview
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {results.recipeInformation.instructionsPreview}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Raw JSON Response</CardTitle>
              <CardDescription>
                Full API response for debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
