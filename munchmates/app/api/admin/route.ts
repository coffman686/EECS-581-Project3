//munchmates/app/api/admin/route.ts
// Admin route that requires 'admin' role.
// Verifies the bearer token and checks for admin role.

import { NextRequest, NextResponse } from 'next/server';
import { verifyBearer, hasRole } from '@/lib/verifyToken';

export async function GET(req: NextRequest) {
    try {
        const claims = await verifyBearer(req.headers.get('authorization') || undefined);
        if (!hasRole(claims, 'admin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.json({ secret: 'Admin zone unlocked ✨' });
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
