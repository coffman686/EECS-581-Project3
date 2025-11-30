import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";

type CustomRecipe = {
    id: number;
    userId: string;
    title: string;
    servings: number;
    readyInMinutes: number;
    dishTypes: string[];
    cuisines: string[];
    ingredients: string[];
    instructions: string;
    createdAt: string;
    image?: string;
};

// Simple in-memory store for custom recipes
const customRecipes = new Map<string, CustomRecipe[]>();
let nextRecipeId = 100000; // Start with high ID to avoid conflicts with Spoonacular IDs

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;

        // Parse request body
        const body = await req.json();
        const { title, servings, readyInMinutes, dishTypes, cuisines, ingredients, instructions } = body;

        // Validate required fields
        if (!title || typeof title !== 'string' || !title.trim()) {
            return NextResponse.json(
                { error: "Recipe title is required" },
                { status: 400 }
            );
        }

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return NextResponse.json(
                { error: "At least one ingredient is required" },
                { status: 400 }
            );
        }

        if (!instructions || typeof instructions !== 'string' || !instructions.trim()) {
            return NextResponse.json(
                { error: "Instructions are required" },
                { status: 400 }
            );
        }

        // Initialize user's custom recipes if not present
        if (!customRecipes.has(userId)) {
            customRecipes.set(userId, []);
        }

        const userRecipes = customRecipes.get(userId)!;

        // Create new recipe
        const newRecipe: CustomRecipe = {
            id: nextRecipeId++,
            userId,
            title: title.trim(),
            servings: servings || 1,
            readyInMinutes: readyInMinutes || 30,
            dishTypes: dishTypes || ['main course'],
            cuisines: cuisines || ['American'],
            ingredients,
            instructions: instructions.trim(),
            createdAt: new Date().toISOString(),
        };

        userRecipes.push(newRecipe);

        return NextResponse.json(
            {
                ok: true,
                message: "Recipe created successfully",
                id: newRecipe.id,
                recipe: newRecipe,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating recipe:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create recipe" },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve user's custom recipes
export async function GET(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;

        const recipes = customRecipes.get(userId) || [];

        return NextResponse.json({
            ok: true,
            recipes,
            count: recipes.length,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}
