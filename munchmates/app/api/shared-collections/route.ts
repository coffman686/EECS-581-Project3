// sharedCollections/[id]/route.ts
// Endpoints to retrieve and manage collections of recipes
// This pertains to managing the list of collections a user holds
// Requires authenticated user
//   GET: retrieves all collections the user has created or joined
//   POST: creates a new collection
//   DELETE: deletes collection itself

import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";
import {
    sharedCollections,
    generateCollectionId,
    SharedCollection
} from "@/lib/sharedCollectionsStore";

// GET - List all collections the user is a member of
export async function GET(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;
        const userName = p.preferred_username || p.name || 'Unknown User';

        // Get all collections where user is a member
        const userCollections: SharedCollection[] = [];
        sharedCollections.forEach((collection) => {
            if (collection.members.some(m => m.userId === userId)) {
                userCollections.push(collection);
            }
        });

        return NextResponse.json({
            ok: true,
            collections: userCollections,
            count: userCollections.length,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}

// POST - Create a new shared collection
export async function POST(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;
        const userName = p.preferred_username || p.name || 'Unknown User';

        const body = await req.json();
        const { name, description } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json(
                { error: "Collection name is required" },
                { status: 400 }
            );
        }

        const newCollection: SharedCollection = {
            id: generateCollectionId(),
            name: name.trim(),
            description: description?.trim() || '',
            createdBy: userId,
            createdByName: userName,
            createdAt: new Date().toISOString(),
            members: [
                {
                    userId,
                    userName,
                    role: 'owner',
                    joinedAt: new Date().toISOString(),
                }
            ],
            recipes: [],
        };

        sharedCollections.set(newCollection.id, newCollection);

        return NextResponse.json(
            {
                ok: true,
                message: "Collection created successfully",
                collection: newCollection,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating collection:", error);
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}

// DELETE - Delete a collection (owner only)
export async function DELETE(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;

        const searchParams = req.nextUrl.searchParams;
        const collectionId = searchParams.get("collectionId");

        if (!collectionId) {
            return NextResponse.json(
                { error: "Missing collectionId parameter" },
                { status: 400 }
            );
        }

        const collection = sharedCollections.get(collectionId);
        if (!collection) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        // Check if user is the owner
        const userMember = collection.members.find(m => m.userId === userId);
        if (!userMember || userMember.role !== 'owner') {
            return NextResponse.json(
                { error: "Only the owner can delete this collection" },
                { status: 403 }
            );
        }

        sharedCollections.delete(collectionId);

        return NextResponse.json({
            ok: true,
            message: "Collection deleted successfully",
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}
