import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/lib/verifyToken";
import { WeeklyMealPlan } from "@/lib/types/meal-plan";

// In-memory store keyed by `${userSub}-${weekStart}`
const mealPlans = new Map<string, WeeklyMealPlan>();

export async function GET(req: NextRequest) {
  try {
    const payload = await verifyBearer(req.headers.get("authorization") || undefined);
    const weekStart = req.nextUrl.searchParams.get("weekStart");

    if (!weekStart) {
      return NextResponse.json({ error: "weekStart parameter required" }, { status: 400 });
    }

    const key = `${payload.sub}-${weekStart}`;
    const plan = mealPlans.get(key);

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await verifyBearer(req.headers.get("authorization") || undefined);
    const body = await req.json();

    if (!body.plan || !body.plan.weekStart) {
      return NextResponse.json({ error: "Invalid meal plan data" }, { status: 400 });
    }

    const plan: WeeklyMealPlan = body.plan;
    const key = `${payload.sub}-${plan.weekStart}`;

    mealPlans.set(key, plan);

    return NextResponse.json({ ok: true, plan });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
