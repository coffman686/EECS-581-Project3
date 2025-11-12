// test route.ts file to showcase how to utilize spoonacular API 
import { NextRequest, NextResponse } from 'next/server';
import {
  searchRecipes,
  getRecipeInformation,
  getRandomRecipes,
  searchRecipesByIngredients,
  searchIngredients,
  getRecipeImageUrl,
  getIngredientImageUrl,
} from '@/lib/spoonacular';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testType = searchParams.get('test') || 'all';

  try {
    const results: Record<string, any> = {
      timestamp: new Date().toISOString(),
      testType,
      apiKeyConfigured: !!process.env.SPOONACULAR_API_KEY,
    };

    // Test 1: Search Recipes
    if (testType === 'recipes' || testType === 'all') {
      console.log('Testing: Search Recipes for "pasta"...');
      const recipesResult = await searchRecipes('pasta', {
        number: 5,
        addRecipeInformation: true,
      });
      results.searchRecipes = {
        query: 'pasta',
        totalResults: recipesResult.totalResults,
        resultsReturned: recipesResult.results.length,
        recipes: recipesResult.results.map((r) => ({
          id: r.id,
          title: r.title,
          image: r.image,
          readyInMinutes: r.readyInMinutes,
        })),
      };
    }

    // Test 2: Search Ingredients
    if (testType === 'ingredients' || testType === 'all') {
      console.log('Testing: Search Ingredients for "chicken"...');
      const ingredientsResult = await searchIngredients('chicken', {
        number: 5,
      });
      results.searchIngredients = {
        query: 'chicken',
        totalResults: ingredientsResult.totalResults,
        resultsReturned: ingredientsResult.results.length,
        ingredients: ingredientsResult.results.map((i) => ({
          id: i.id,
          name: i.name,
          image: i.image,
          imageUrl: getIngredientImageUrl(i.image),
        })),
      };
    }

    // Test 3: Get Random Recipes
    if (testType === 'random' || testType === 'all') {
      console.log('Testing: Get Random Recipes (vegetarian)...');
      const randomResult = await getRandomRecipes({
        number: 3,
        tags: 'vegetarian',
      });
      results.randomRecipes = {
        count: randomResult.recipes.length,
        recipes: randomResult.recipes.map((r) => ({
          id: r.id,
          title: r.title,
          image: r.image,
          readyInMinutes: r.readyInMinutes,
          servings: r.servings,
          vegetarian: r.vegetarian,
          vegan: r.vegan,
          glutenFree: r.glutenFree,
          healthScore: r.healthScore,
        })),
      };
    }

    // Test 4: Search Recipes by Ingredients
    if (testType === 'byIngredients' || testType === 'all') {
      console.log('Testing: Search Recipes by Ingredients...');
      const byIngredientsResult = await searchRecipesByIngredients(
        'chicken,rice,tomato',
        { number: 5 }
      );
      results.searchByIngredients = {
        ingredients: 'chicken,rice,tomato',
        resultsReturned: byIngredientsResult.length,
        recipes: byIngredientsResult.map((r) => ({
          id: r.id,
          title: r.title,
          image: r.image,
        })),
      };
    }

    // Test 5: Get Recipe Information (detailed)
    if (testType === 'recipeInfo' || testType === 'all') {
      // First, get a recipe ID from search
      const searchResult = await searchRecipes('lasagna', { number: 1 });
      if (searchResult.results.length > 0) {
        const recipeId = searchResult.results[0].id;
        console.log(`Testing: Get Recipe Information for ID ${recipeId}...`);

        const recipeInfo = await getRecipeInformation(recipeId);
        results.recipeInformation = {
          id: recipeInfo.id,
          title: recipeInfo.title,
          readyInMinutes: recipeInfo.readyInMinutes,
          servings: recipeInfo.servings,
          healthScore: recipeInfo.healthScore,
          cuisines: recipeInfo.cuisines,
          dishTypes: recipeInfo.dishTypes,
          diets: recipeInfo.diets,
          vegetarian: recipeInfo.vegetarian,
          vegan: recipeInfo.vegan,
          glutenFree: recipeInfo.glutenFree,
          ingredientsCount: recipeInfo.extendedIngredients?.length || 0,
          ingredients: recipeInfo.extendedIngredients
            ?.slice(0, 5)
            .map((i) => ({
              name: i.name,
              amount: i.amount,
              unit: i.unit,
            })),
          hasInstructions: !!recipeInfo.instructions,
          instructionsPreview: recipeInfo.instructions
            ? recipeInfo.instructions.substring(0, 200) + '...'
            : null,
        };
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Spoonacular API tests completed successfully',
        ...results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Spoonacular API test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        apiKeyConfigured: !!process.env.SPOONACULAR_API_KEY,
        hint: !process.env.SPOONACULAR_API_KEY
          ? 'Make sure SPOONACULAR_API_KEY is set in your .env.local file'
          : 'Check if your API key is valid and has not exceeded rate limits',
      },
      { status: 500 }
    );
  }
}
