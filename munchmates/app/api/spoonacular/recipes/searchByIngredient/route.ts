// searchByIngredients/route.ts
// endpoints for searching a recipe that contain a list of ingredients
// Inputs:
// - ingredients: CS list of ingredients the recipe should contain
// - cuisine: the cuisine the recipe should be a part of
// - dishType: the type of recipe to look for
// - diets: the user's diet
// - intolerances: the user's intolerances and allergens

import { NextRequest, NextResponse } from 'next/server';
import { searchRecipes } from '@/lib/spoonacular';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ingredients = searchParams.get('ingredients') ?? undefined;
    const cuisine = searchParams.get('cuisine') ?? undefined
    const dishType = searchParams.get('dishType') ?? undefined
    const diet = searchParams.get("diet") ?? undefined;
    const intolerances = searchParams.get("intolerances") ?? undefined;
    if (!ingredients) {
        return NextResponse.json({ error: 'Missing ingredients parameter' }, { status: 400 });
    }
    try {
        const recipes = await searchRecipes('', {
            includeIngredients: ingredients,
            addRecipeInformation: true,
            cuisine: cuisine,
            type: dishType,
            diet: diet,
            intolerances: intolerances,
            number: 48, //idk what to set this to yet
        });
        const results = recipes.results.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            score: recipe.spoonacularScore ? Math.round(recipe.spoonacularScore) : 0,
            servings: recipe.servings,
            readyInMinutes: recipe.readyInMinutes,
            cuisines: recipe.cuisines,
            dishTypes: recipe.dishTypes,
        }))
        return NextResponse.json({ results });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }
}
