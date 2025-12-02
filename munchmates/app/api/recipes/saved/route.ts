import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";
import { savedRecipesStore, SavedRecipe } from "@/lib/savedRecipesStore";

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

        // Check if recipe is already saved
        if (savedRecipesStore.hasRecipe(userId, recipeId)) {
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

        savedRecipesStore.addRecipe(userId, newSavedRecipe);

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

        const recipes = savedRecipesStore.get(userId);

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

        const removed = savedRecipesStore.removeRecipe(userId, parseInt(recipeId));

        if (!removed) {
            return NextResponse.json(
                { error: "Recipe not found in saved recipes" },
                { status: 404 }
            );
        }

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
