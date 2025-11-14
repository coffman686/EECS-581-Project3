import { NextRequest, NextResponse } from 'next/server';
import { searchRecipesByIngredients } from '@/lib/spoonacular';
  
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ingredients = searchParams.get('ingredients');
    if (!ingredients) {
        return NextResponse.json({ error: 'Missing ingredients parameter' }, { status: 400 });
    }
    try {
        const recipes = await searchRecipesByIngredients((ingredients), {
            number: 10,
        });
        return NextResponse.json({ recipes });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }
}