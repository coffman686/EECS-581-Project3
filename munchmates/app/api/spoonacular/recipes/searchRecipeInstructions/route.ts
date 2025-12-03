// file: recipes/info/route.ts
// GET endpoint to fetch recipe instructions
// Inputs: spooncular recipe ID
// Output:
// - Instructions to produce
// - 404 if valid ID not provided
// - 500 otherwise

import { NextRequest, NextResponse } from 'next/server';
import { getRecipeInstructions } from '@/lib/spoonacular';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const idParam = searchParams.get('id');
    if (!idParam) {
        return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }
    try {
        const id = parseInt(idParam, 10);
        const instructions = await getRecipeInstructions(id);
        return NextResponse.json({ instructions });
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to fetch recipe instructions' }, { status: 500 });
    }
}
