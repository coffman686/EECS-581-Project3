import { NextRequest, NextResponse } from 'next/server';

/*
This file will handle searching for recipe instructions based on a recipe ID.
    This will be called in recipes/[id]/page.tsx to get the instructions for the recipe.
    To do before implementhing this endpoint:
        - Include instruction search function in lib/spoonacular.ts
        Endpoint: https://api.spoonacular.com/recipes/{id}/analyzedInstructions
    This endpoint will return:
        - An array of instruction steps for the given recipe ID
        - Not entirely sure how to do everything yet, the output is kinda weird
        - I can probably make a good interface with some list comprehension
*/