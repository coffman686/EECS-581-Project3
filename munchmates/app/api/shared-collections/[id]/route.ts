// sharedCollections/[id]/route.ts
// Endpoints to retrieve, update, and manage a recipe collection
// This pertains specifically to accessing and modifying individual collections
// Requires authenticated user
//   GET: retrieves collection information
//   PUT: handles updating collection information, recipe addition, recipe removal and removes recipes
//   DELETE: allows user to leave a collection

import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";
import {
    sharedCollections,
    SharedCollection,
    CollectionMember,
    SharedRecipe
} from "../../../../lib/sharedCollectionsStore";

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET - Get a specific collection by ID
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;
        const { id: collectionId } = await context.params;

        const collection = sharedCollections.get(collectionId);
        if (!collection) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        // Check if user is a member
        const isMember = collection.members.some((m: CollectionMember) => m.userId === userId);
        if (!isMember) {
            return NextResponse.json(
                { error: "You don't have access to this collection" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            ok: true,
            collection,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}

// PUT - Update collection (name, description) or add/remove recipes
export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;
        const userName = p.preferred_username || p.name || 'Unknown User';
        const { id: collectionId } = await context.params;

        const collection = sharedCollections.get(collectionId);
        if (!collection) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        // Check if user is a member with edit rights
        const userMember = collection.members.find((m: CollectionMember) => m.userId === userId);
        if (!userMember || userMember.role === 'viewer') {
            return NextResponse.json(
                { error: "You don't have permission to edit this collection" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { action, name, description, recipeId, recipeName } = body;

        switch (action) {
            case 'update':
                // Update collection details
                if (name !== undefined) {
                    collection.name = name.trim();
                }
                if (description !== undefined) {
                    collection.description = description.trim();
                }
                break;

            case 'addRecipe':
                // Add a recipe to the collection
                if (!recipeId || !recipeName) {
                    return NextResponse.json(
                        { error: "recipeId and recipeName are required" },
                        { status: 400 }
                    );
                }

                // Check if recipe already exists
                const existingRecipe = collection.recipes.find((r: SharedRecipe) => r.recipeId === recipeId);
                if (existingRecipe) {
                    return NextResponse.json(
                        { message: "Recipe is already in this collection" },
                        { status: 200 }
                    );
                }

                collection.recipes.push({
                    recipeId,
                    recipeName,
                    addedBy: userId,
                    addedByName: userName,
                    addedAt: new Date().toISOString(),
                });
                break;

            case 'removeRecipe':
                // Remove a recipe from the collection
                if (!recipeId) {
                    return NextResponse.json(
                        { error: "recipeId is required" },
                        { status: 400 }
                    );
                }

                const recipeIndex = collection.recipes.findIndex((r: SharedRecipe) => r.recipeId === recipeId);
                if (recipeIndex === -1) {
                    return NextResponse.json(
                        { error: "Recipe not found in collection" },
                        { status: 404 }
                    );
                }

                collection.recipes.splice(recipeIndex, 1);
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid action. Use 'update', 'addRecipe', or 'removeRecipe'" },
                    { status: 400 }
                );
        }

        sharedCollections.set(collectionId, collection);

        return NextResponse.json({
            ok: true,
            message: "Collection updated successfully",
            collection,
        });
    } catch (error) {
        console.error("Error updating collection:", error);
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}

// DELETE - Remove user from collection or delete collection
export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;
        const { id: collectionId } = await context.params;

        const collection = sharedCollections.get(collectionId);
        if (!collection) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        const userMember = collection.members.find((m: CollectionMember) => m.userId === userId);
        if (!userMember) {
            return NextResponse.json(
                { error: "You are not a member of this collection" },
                { status: 403 }
            );
        }

        if (userMember.role === 'owner') {
            // Owner deletes the entire collection
            sharedCollections.delete(collectionId);
            return NextResponse.json({
                ok: true,
                message: "Collection deleted successfully",
            });
        } else {
            // Non-owner leaves the collection
            collection.members = collection.members.filter((m: CollectionMember) => m.userId !== userId);
            sharedCollections.set(collectionId, collection);
            return NextResponse.json({
                ok: true,
                message: "You have left the collection",
            });
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}
