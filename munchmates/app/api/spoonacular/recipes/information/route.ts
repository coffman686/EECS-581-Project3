import { NextRequest, NextResponse } from 'next/server';
import { getRecipeInformation } from '@/lib/spoonacular';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const idParam = searchParams.get('id');
    
    if (!idParam) {
        return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }
    
    try {
        const id = parseInt(idParam, 10);
        const recipeInfo = await getRecipeInformation(id);
        return NextResponse.json(recipeInfo);
    } catch (error) {
        console.error('Error fetching recipe information:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check for API limit exceeded
        if (errorMessage.includes('402')) {
            return NextResponse.json(
                { error: 'API daily limit reached. Please try again tomorrow or upgrade your Spoonacular plan.' },
                { status: 402 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to fetch recipe information', details: errorMessage },
            { status: 500 }
        );
    }
}
