// file: recipes/info/route.ts
// GET endpoint to fetch additioinal recipe information
// Inputs: spooncular recipe ID
// Output:
// - Recipe information if successful
// - 404 if id not provided
// - 500 otherwise

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
