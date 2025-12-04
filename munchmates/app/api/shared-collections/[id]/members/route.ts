// munchmates/app/api/shared-collections/[id]/members/route.ts
// Manage members of a shared collection.
// Supports adding, removing, and updating member roles.

import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";
import { 
    sharedCollections, 
    CollectionMember 
} from "../../../../../lib/sharedCollectionsStore";

type RouteContext = {
    params: Promise<{ id: string }>;
};

// POST - Add a member to the collection
export async function POST(req: NextRequest, context: RouteContext) {
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

        // Check if user is owner or editor
        const userMember = collection.members.find((m: CollectionMember) => m.userId === userId);
        if (!userMember || userMember.role === 'viewer') {
            return NextResponse.json(
                { error: "You don't have permission to add members" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { memberId, memberName, role = 'viewer' } = body;

        if (!memberId || !memberName) {
            return NextResponse.json(
                { error: "memberId and memberName are required" },
                { status: 400 }
            );
        }

        // Validate role
        if (!['editor', 'viewer'].includes(role)) {
            return NextResponse.json(
                { error: "Role must be 'editor' or 'viewer'" },
                { status: 400 }
            );
        }

        // Check if member already exists
        const existingMember = collection.members.find((m: CollectionMember) => m.userId === memberId);
        if (existingMember) {
            return NextResponse.json(
                { message: "User is already a member of this collection" },
                { status: 200 }
            );
        }

        collection.members.push({
            userId: memberId,
            userName: memberName,
            role: role as 'editor' | 'viewer',
            joinedAt: new Date().toISOString(),
        });

        sharedCollections.set(collectionId, collection);

        return NextResponse.json({
            ok: true,
            message: "Member added successfully",
            collection,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}

// DELETE - Remove a member from the collection
export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const userId = p.sub;
        const { id: collectionId } = await context.params;

        const searchParams = req.nextUrl.searchParams;
        const memberId = searchParams.get("memberId");

        if (!memberId) {
            return NextResponse.json(
                { error: "memberId parameter is required" },
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

        // Check if user is owner
        const userMember = collection.members.find((m: CollectionMember) => m.userId === userId);
        if (!userMember || userMember.role !== 'owner') {
            return NextResponse.json(
                { error: "Only the owner can remove members" },
                { status: 403 }
            );
        }

        // Can't remove the owner
        const targetMember = collection.members.find((m: CollectionMember) => m.userId === memberId);
        if (!targetMember) {
            return NextResponse.json(
                { error: "Member not found in collection" },
                { status: 404 }
            );
        }

        if (targetMember.role === 'owner') {
            return NextResponse.json(
                { error: "Cannot remove the owner from the collection" },
                { status: 400 }
            );
        }

        collection.members = collection.members.filter((m: CollectionMember) => m.userId !== memberId);
        sharedCollections.set(collectionId, collection);

        return NextResponse.json({
            ok: true,
            message: "Member removed successfully",
            collection,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}

// PUT - Update a member's role
export async function PUT(req: NextRequest, context: RouteContext) {
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

        // Check if user is owner
        const userMember = collection.members.find((m: CollectionMember) => m.userId === userId);
        if (!userMember || userMember.role !== 'owner') {
            return NextResponse.json(
                { error: "Only the owner can change member roles" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { memberId, role } = body;

        if (!memberId || !role) {
            return NextResponse.json(
                { error: "memberId and role are required" },
                { status: 400 }
            );
        }

        if (!['editor', 'viewer'].includes(role)) {
            return NextResponse.json(
                { error: "Role must be 'editor' or 'viewer'" },
                { status: 400 }
            );
        }

        const memberIndex = collection.members.findIndex((m: CollectionMember) => m.userId === memberId);
        if (memberIndex === -1) {
            return NextResponse.json(
                { error: "Member not found in collection" },
                { status: 404 }
            );
        }

        if (collection.members[memberIndex].role === 'owner') {
            return NextResponse.json(
                { error: "Cannot change the owner's role" },
                { status: 400 }
            );
        }

        collection.members[memberIndex].role = role;
        sharedCollections.set(collectionId, collection);

        return NextResponse.json({
            ok: true,
            message: "Member role updated successfully",
            collection,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}
