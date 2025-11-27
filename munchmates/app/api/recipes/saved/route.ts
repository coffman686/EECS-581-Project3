import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";

type SavedRecipe = {
    userId: string;
    recipeId: number;
    recipeName: string;
    savedAt: string;
};

// Simple in-memory store for saved recipes
const savedRecipes = new Map<string, SavedRecipe[]>();

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;

        // Parse request body
        const body = await req.json();
        const { recipeId, recipeName } = body;

        if (!recipeId || !recipeName) {
            return NextResponse.json(
                { error: "Missing required fields: recipeId and recipeName" },
                { status: 400 }
            );
        }

        // Initialize user's saved recipes if not present
        if (!savedRecipes.has(userId)) {
            savedRecipes.set(userId, []);
        }

        const userSavedRecipes = savedRecipes.get(userId)!;

        // Check if recipe is already saved
        const existingIndex = userSavedRecipes.findIndex(
            (r) => r.recipeId === recipeId
        );

        if (existingIndex >= 0) {
            return NextResponse.json(
                { message: "Recipe is already saved" },
                { status: 200 }
            );
        }

        // Add new saved recipe
        const newSavedRecipe: SavedRecipe = {
            userId,
            recipeId,
            recipeName,
            savedAt: new Date().toISOString(),
        };

        userSavedRecipes.push(newSavedRecipe);

        return NextResponse.json(
            {
                ok: true,
                message: "Recipe saved successfully",
                recipe: newSavedRecipe,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error saving recipe:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: "Failed to save recipe" },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve user's saved recipes
export async function GET(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;

        const recipes = savedRecipes.get(userId) || [];

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

// DELETE endpoint to remove a saved recipe
export async function DELETE(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;

        const searchParams = req.nextUrl.searchParams;
        const recipeId = searchParams.get("recipeId");

        if (!recipeId) {
            return NextResponse.json(
                { error: "Missing recipeId parameter" },
                { status: 400 }
            );
        }

        const userSavedRecipes = savedRecipes.get(userId);
        if (!userSavedRecipes) {
            return NextResponse.json(
                { error: "No saved recipes found" },
                { status: 404 }
            );
        }

        const index = userSavedRecipes.findIndex(
            (r) => r.recipeId === parseInt(recipeId)
        );

        if (index === -1) {
            return NextResponse.json(
                { error: "Recipe not found in saved recipes" },
                { status: 404 }
            );
        }

        userSavedRecipes.splice(index, 1);

        return NextResponse.json({
            ok: true,
            message: "Recipe removed from saved recipes",
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}
