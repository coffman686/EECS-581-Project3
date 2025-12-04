// munchmates/app/api/spoonacular/recipes/info/route.ts
// Recipe information route.
// Fetches detailed recipe data from Spoonacular using
// a recipe ID provided via query parameters.

import { NextRequest, NextResponse } from 'next/server';
import { getRecipeInformation } from '@/lib/spoonacular';

export async function GET(req: NextRequest) {
  const recipeId = req.nextUrl.searchParams.get('id');

  if (!recipeId) {
    return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
  }

  try {
    const recipeInfo = await getRecipeInformation(parseInt(recipeId, 10));
    return NextResponse.json(recipeInfo);
  } catch (error) {
    console.error('Failed to fetch recipe info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe information' },
      { status: 500 }
    );
  }
}
