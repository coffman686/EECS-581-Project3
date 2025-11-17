import { NextRequest, NextResponse } from 'next/server';
import { searchRecipes } from '@/lib/spoonacular';
  
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ingredients = searchParams.get('ingredients');
    if (!ingredients) {
        return NextResponse.json({ error: 'Missing ingredients parameter' }, { status: 400 });
    }
    try {
        const recipes = await searchRecipes('', {
            includeIngredients: ingredients,
            addRecipeInformation: true,
            number: 10, //temp parameter
        });
        console.log('Fetched recipes by ingredients:', recipes);
        const results = recipes.results.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            score: recipe.spoonacularScore ? Math.round(recipe.spoonacularScore) : 0,
            servings: recipe.servings,
            readyInMinutes: recipe.readyInMinutes,
        }))
        return NextResponse.json({ results });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }
}