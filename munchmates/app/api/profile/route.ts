// app/api/profile/route.ts
// Endpoint to retrieve and update user profile data in memory for local persistence
// Temporary until munchmates goes public and we can afford 200 petabytes (onsite, no redundancy) to appease the shareholders

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
