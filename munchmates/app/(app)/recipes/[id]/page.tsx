'use client';

import { useState } from 'react';
import { usePathname } from "next/navigation";

const Recipe = () => {
    const pathname = usePathname();
    const id = pathname.split('/').pop();

    return (
        <div>
            {`Recipe Detail Page for id: ${id}`}
        </div>
    )
}

export default Recipe;