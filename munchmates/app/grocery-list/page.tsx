// app/grocery-list/page.tsx

import AppHeader from "@/components/layout/app-header";

export default function GroceryListPage() {
    return (
        <div className="flex h-full w-full flex-col">
            <AppHeader title="Grocery List" />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-headline">Smart Grocery List</h2>
                        <p className="text-muted-foreground mt-2">Coming Soon</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

