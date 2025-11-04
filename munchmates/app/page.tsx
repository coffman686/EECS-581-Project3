// app/page.tsx
'use client';
import Link from 'next/link';

export default function Home() {
    return (
        <main style={{ padding: 24 }}>
            <h1>Home</h1>
            <p><Link href="/dashboard">Sign in →</Link></p>
        </main>
    );
}
