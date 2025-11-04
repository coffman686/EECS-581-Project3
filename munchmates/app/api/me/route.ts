// app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyBearer } from '@/lib/verifyToken';

export async function GET(req: NextRequest) {
    try {
        const p = await verifyBearer(req.headers.get('authorization') || undefined);
        return NextResponse.json({
            sub: p.sub,
            email: p.email,
            preferred_username: p.preferred_username,
            roles: p.realm_access?.roles ?? [],
        });
    } catch (e) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
