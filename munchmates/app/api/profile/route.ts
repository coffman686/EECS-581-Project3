// app/api/profile/route.ts
// User profile route.
// Authenticates user and handles fetching or updating profile preferences.

import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";

type ProfileData = {
    favoriteCuisines: string;
    diets: string[];
    intolerances: string[];
};

// Simple in-memory store keyed by user sub
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
