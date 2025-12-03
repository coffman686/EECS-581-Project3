// Saved Recipes API Route
// Handles per-user profile data for favorites, diets, and intolerances.
// Uses a simple in-memory Map keyed by the authenticated user’s `sub` claim.
// GET  → Returns the stored profile for the requesting user (or defaults).
// POST → Updates the user’s profile entry with favorite cuisines, diets,
//        and intolerance lists. Requires a valid Bearer token.
// NOTE: This storage is ephemeral — it resets on server restart. A database
//       should replace this once persistent user profiles are needed.

import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";

type ProfileData = {
    favoriteCuisines: string;
    diets: string[];
    intolerances: string[];
};

// simple in-memory store keyed by user sub
const profiles = new Map<string, ProfileData>();

export async function GET(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const existing =
            profiles.get(p.sub) ?? {
                favoriteCuisines: "",
                diets: [],
                intolerances: [],
            };

        return NextResponse.json(existing);
    } catch (e) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get("authorization") || undefined);
        const body = await req.json();

        const update: ProfileData = {
            favoriteCuisines: body.favoriteCuisines ?? "",
            diets: body.diets ?? [],
            intolerances: body.intolerances ?? [],
        };

        profiles.set(p.sub, update);

        return NextResponse.json({ ok: true, profile: update });
    } catch (e) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}