// Dashboard Page
// Renders the main MunchMates home experience after login, giving users a
// high-level snapshot of their cooking, planning, and pantry activity.
// Includes:
// - Personalized greeting from Keycloak ID/Access token claims
// - "Tip of the day" motivation, rotated deterministically by date
// - Today’s meal plan (breakfast / lunch / dinner) with quick links to recipes
// - Quick action cards for Recipes, Meal Planner, Grocery List, Pantry,
//   Shared Collections, and Community
// - Pantry alerts for items expiring soon (localStorage-backed)
// - Grocery list summary with active item count (localStorage-backed)
// - Saved recipes preview (localStorage-backed favorites)
// - Shared collections preview from /api/shared-collections
// - Weekly stats for meals planned, saved recipes, pantry alerts, collections
// Behavior:
// - Prefers authenticated API data but gracefully falls back to localStorage
// - Initializes a dietary preferences dialog on first visit via local flag
// - Designed as the central hub tying together all major app features.

'use client';

import RequireAuth from '@/components/RequireAuth';
import { ensureToken, getParsedIdToken, getAccessTokenClaims, keycloak } from '@/lib/keycloak';
import { useEffect, useState } from 'react';
import { authedFetch } from '@/lib/authedFetch';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Link from 'next/link';
import Image from 'next/image';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    CalendarDays,
    ShoppingCart,
    Warehouse,
    Users,
    ArrowRight,
    Clock,
    AlertTriangle,
    Heart,
    Utensils,
    Coffee,
    Moon,
    ChefHat,
    Sparkles,
    FolderHeart
} from 'lucide-react';
import { DietaryDialog } from '@/components/ingredients/Dietary';

// Types
type IdClaims = { name?: string; preferred_username?: string; email?: string };
type AccessClaims = { preferred_username?: string; email?: string; realm_access?: { roles?: string[] } };

// Meal planner entry
interface MealPlanEntry {
    id: string;
    recipeId: number;
    title: string;
    image?: string;
    servings: number;
    originalServings: number;
}

// Meal plan for single day
interface DayPlan {
    date: string;
    breakfast?: MealPlanEntry;
    lunch?: MealPlanEntry;
    dinner?: MealPlanEntry;
}

// Meal plan for entire week
interface WeeklyMealPlan {
    weekStart: string;
    days: DayPlan[];
}

// Pantry items
interface PantryItem {
    id: number;
    name: string;
    quantity: string;
    category: string;
    expiryDate?: string;
    addedDate: string;
}

// Grocery list items
interface GroceryItem {
    id: string;
    name: string;
    category: string;
    completed: boolean;
    quantity?: string;
    fromMealPlan?: boolean;
}

// Saved recipes
interface SavedRecipe {
    recipeId: number;
    recipeName: string;
    savedAt: string;
    recipeImage?: string;
}

// Shared recipes
interface SharedCollection {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    members: { userId: string; userName: string; role: string; joinedAt: string }[];
    recipes: { recipeId: number; recipeName: string; addedBy: string; addedByName: string; addedAt: string }[];
}

// Helper functions
function getWeekMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

// Format date as YYYY-MM-DD in local timezone (avoids UTC shift issues)
function formatLocalDateStr(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Greet user based on current time
function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

// Calculate difference between current date and expiration date
function getDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Format date with user locale
function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

// Motivational tips
const cookingTips = [
    "Try adding a splash of acid (lemon juice or vinegar) to brighten up any dish!",
    "Prep your ingredients before you start cooking - it makes everything smoother.",
    "Don't be afraid to experiment with spices. Start small and taste as you go!",
    "Fresh herbs can transform a simple dish into something special.",
    "Let your meat rest after cooking for juicier results.",
    "Taste your food as you cook - seasoning adjustments make all the difference.",
    "A sharp knife is a safe knife. Keep your blades honed!",
    "Room temperature ingredients blend better in baking.",
];

export default function Dashboard() {
    const [name, setName] = useState('');
    const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
    const [pantryAlerts, setPantryAlerts] = useState<PantryItem[]>([]);
    const [groceryCount, setGroceryCount] = useState(0);
    const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
    const [collections, setCollections] = useState<SharedCollection[]>([]);
    const [weeklyStats, setWeeklyStats] = useState({ mealsPlanned: 0, recipesTotal: 0 });
    const [tipOfDay, setTipOfDay] = useState('');

    // Dietary preferences modal
    const [dietModal, setDietModal] = useState(false);
    const [diets, setDiets] = useState<string[]>([]);
    const [intolerances, setIntolerances] = useState<string[]>([]);

    // Open dietary preferences modal if uninitialized
    useEffect(() => {
        const localDietsInit = localStorage.getItem("hasDietsInit");
        if (localDietsInit !== "true") {
            setDietModal(true);
        }
    }, []);

    // Close preferences modal and complete initialization
    function closeDiet(e: React.SyntheticEvent) {
        e.preventDefault();
        localStorage.setItem("hasDietsInit", "true");
        setDietModal(false);
    }

    // Set tip of the day (changes daily based on date)
    useEffect(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        setTipOfDay(cookingTips[dayOfYear % cookingTips.length]);
    }, []);

    // Load user info
    useEffect(() => {
        let mounted = true;

        const readClaims = () => {
            const id = (getParsedIdToken<IdClaims>() ?? {}) as IdClaims;
            const acc = (getAccessTokenClaims<AccessClaims>() ?? {}) as AccessClaims;
            setName(id.name || id.preferred_username || acc.preferred_username || '');
        };

        (async () => {
            await ensureToken();
            if (!mounted) return;
            readClaims();
        })();

        keycloak.onAuthSuccess = async () => {
            if (!mounted) return;
            await ensureToken();
            readClaims();
        };
        keycloak.onAuthRefreshSuccess = async () => {
            if (!mounted) return;
            await ensureToken();
            readClaims();
        };

        return () => {
            mounted = false;
            keycloak.onAuthSuccess = undefined;
            keycloak.onAuthRefreshSuccess = undefined;
        };
    }, []);

    // Load today's meal plan
    useEffect(() => {
        const loadMealPlan = async () => {
            const today = new Date();
            const weekMonday = getWeekMonday(today);
            const weekStart = formatLocalDateStr(weekMonday);
            const todayStr = formatLocalDateStr(today);

            try {
                // Try API first
                const res = await authedFetch(`/api/meal-plan?weekStart=${weekStart}`);
                if (res.ok) {
                    const data: WeeklyMealPlan = await res.json();
                    const todayMeals = data.days.find(d => d.date === todayStr);
                    setTodayPlan(todayMeals || null);

                    // Calculate weekly stats
                    let mealsCount = 0;
                    data.days.forEach(day => {
                        if (day.breakfast) mealsCount++;
                        if (day.lunch) mealsCount++;
                        if (day.dinner) mealsCount++;
                    });
                    setWeeklyStats(prev => ({ ...prev, mealsPlanned: mealsCount }));
                    return;
                }
            } catch {
                // Fall back to localStorage
            }

            // localStorage fallback
            const stored = localStorage.getItem(`mealPlan-${weekStart}`);
            if (stored) {
                const data: WeeklyMealPlan = JSON.parse(stored);
                const todayMeals = data.days.find(d => d.date === todayStr);
                setTodayPlan(todayMeals || null);

                let mealsCount = 0;
                data.days.forEach(day => {
                    if (day.breakfast) mealsCount++;
                    if (day.lunch) mealsCount++;
                    if (day.dinner) mealsCount++;
                });
                setWeeklyStats(prev => ({ ...prev, mealsPlanned: mealsCount }));
            }
        };

        loadMealPlan();
    }, []);

    // Load pantry alerts (expiring soon)
    useEffect(() => {
        const stored = localStorage.getItem('munchmates_pantry');
        if (stored) {
            const items: PantryItem[] = JSON.parse(stored);
            const expiring = items.filter(item => {
                if (!item.expiryDate) return false;
                const days = getDaysUntilExpiry(item.expiryDate);
                return days <= 7 && days >= 0;
            }).sort((a, b) => getDaysUntilExpiry(a.expiryDate!) - getDaysUntilExpiry(b.expiryDate!));
            setPantryAlerts(expiring.slice(0, 5));
        }
    }, []);

    // Load grocery list count
    useEffect(() => {
        const stored = localStorage.getItem('grocery-list-items');
        if (stored) {
            const items: GroceryItem[] = JSON.parse(stored);
            const activeCount = items.filter(i => !i.completed).length;
            setGroceryCount(activeCount);
        }
    }, []);

    // Load saved recipes
    useEffect(() => {
        const stored = localStorage.getItem('saved-recipes');
        if (stored) {
            const recipes: SavedRecipe[] = JSON.parse(stored);
            const recent = recipes
                .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
                .slice(0, 4);
            setSavedRecipes(recent);
            setWeeklyStats(prev => ({ ...prev, recipesTotal: recipes.length }));
        }
    }, []);

    // Load shared collections
    useEffect(() => {
        const loadCollections = async () => {
            try {
                const res = await authedFetch('/api/shared-collections');
                if (res.ok) {
                    const data = await res.json();
                    const collectionsArray: SharedCollection[] = data.collections || [];
                    setCollections(collectionsArray.slice(0, 3));
                }
            } catch {
                // Collections not available
            }
        };
        loadCollections();
    }, []);

    // Setup sidebar quick actions
    const quickActions = [
        { href: '/recipes', icon: BookOpen, label: 'Find Recipes', description: 'Discover new dishes' },
        { href: '/meal-planner', icon: CalendarDays, label: 'Plan Meals', description: 'Organize your week' },
        { href: '/grocery-list', icon: ShoppingCart, label: 'Grocery List', description: `${groceryCount} items to buy` },
        { href: '/pantry', icon: Warehouse, label: 'Check Pantry', description: 'Manage ingredients' },
        { href: '/shared-collections', icon: FolderHeart, label: 'Collections', description: 'Shared recipes' },
        { href: '/community', icon: Users, label: 'Community', description: 'Connect with others' },
    ];

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title="Dashboard" />

                        <main className="flex-1 p-6 bg-muted/20">
                            <div className="w-full space-y-6">

                                {/* Welcome Section */}
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6 md:p-8">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-primary mb-2">
                                            <Sparkles className="h-5 w-5" />
                                            <span className="text-sm font-medium">{formatDate(new Date())}</span>
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                            {getGreeting()}, {name || 'Chef'}!
                                        </h1>
                                        <p className="mt-2 text-muted-foreground max-w-xl">
                                            {tipOfDay}
                                        </p>
                                    </div>
                                    <ChefHat className="absolute right-4 bottom-4 h-24 w-24 text-primary/10" />
                                </div>

                                {/* Today's Meals */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Utensils className="h-5 w-5 text-primary" />
                                                Today&apos;s Meals
                                            </CardTitle>
                                            <CardDescription>What&apos;s cooking today?</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/meal-planner">
                                                View Week <ArrowRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {todayPlan && (todayPlan.breakfast || todayPlan.lunch || todayPlan.dinner) ? (
                                            <div className="grid gap-4 md:grid-cols-3">
                                                {/* Breakfast */}
                                                {todayPlan.breakfast ? (
                                                    <Link href={`/recipes/${todayPlan.breakfast.recipeId}`}>
                                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                                                <Coffee className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-muted-foreground">Breakfast</p>
                                                                <p className="font-medium truncate">{todayPlan.breakfast.title}</p>
                                                            </div>
                                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                                            <Coffee className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-muted-foreground">Breakfast</p>
                                                            <p className="text-sm text-muted-foreground">Not planned</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Lunch */}
                                                {todayPlan.lunch ? (
                                                    <Link href={`/recipes/${todayPlan.lunch.recipeId}`}>
                                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                                <Utensils className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-muted-foreground">Lunch</p>
                                                                <p className="font-medium truncate">{todayPlan.lunch.title}</p>
                                                            </div>
                                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                            <Utensils className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-muted-foreground">Lunch</p>
                                                            <p className="text-sm text-muted-foreground">Not planned</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dinner */}
                                                {todayPlan.dinner ? (
                                                    <Link href={`/recipes/${todayPlan.dinner.recipeId}`}>
                                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                                                <Moon className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-muted-foreground">Dinner</p>
                                                                <p className="font-medium truncate">{todayPlan.dinner.title}</p>
                                                            </div>
                                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                                            <Moon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-muted-foreground">Dinner</p>
                                                            <p className="text-sm text-muted-foreground">Not planned</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Utensils className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                <p className="mt-2 text-muted-foreground">No meals planned for today</p>
                                                <Button className="mt-4" asChild>
                                                    <Link href="/meal-planner">Plan Today&apos;s Meals</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                                    {quickActions.map((action) => (
                                        <Link key={action.href} href={action.href}>
                                            <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                                                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                                                        <action.icon className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <p className="font-medium text-sm">{action.label}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Pantry Alerts */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                                    Pantry Alerts
                                                </CardTitle>
                                                <CardDescription>Items expiring soon</CardDescription>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href="/pantry">
                                                    View All <ArrowRight className="ml-1 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {pantryAlerts.length > 0 ? (
                                                <div className="space-y-3">
                                                    {pantryAlerts.map((item) => {
                                                        const days = getDaysUntilExpiry(item.expiryDate!);
                                                        return (
                                                            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                                                <div>
                                                                    <p className="font-medium">{item.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{item.quantity}</p>
                                                                </div>
                                                                <Badge variant={days <= 3 ? "destructive" : "secondary"}>
                                                                    <Clock className="mr-1 h-3 w-3" />
                                                                    {days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <Warehouse className="mx-auto h-10 w-10 text-muted-foreground/50" />
                                                    <p className="mt-2 text-sm text-muted-foreground">No items expiring soon</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Grocery List Preview */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                                    Grocery List
                                                </CardTitle>
                                                <CardDescription>Items to buy</CardDescription>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href="/grocery-list">
                                                    View List <ArrowRight className="ml-1 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {groceryCount > 0 ? (
                                                <div className="text-center py-6">
                                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                                        <span className="text-2xl font-bold text-primary">{groceryCount}</span>
                                                    </div>
                                                    <p className="mt-3 text-muted-foreground">
                                                        {groceryCount === 1 ? 'item' : 'items'} on your list
                                                    </p>
                                                    <Button className="mt-4" variant="outline" asChild>
                                                        <Link href="/grocery-list">Start Shopping</Link>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/50" />
                                                    <p className="mt-2 text-sm text-muted-foreground">Your grocery list is empty</p>
                                                    <Button className="mt-4" variant="outline" asChild>
                                                        <Link href="/meal-planner">Generate from Meal Plan</Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Saved Recipes */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Heart className="h-5 w-5 text-red-500" />
                                                Saved Recipes
                                            </CardTitle>
                                            <CardDescription>Your favorites</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/recipes/saved">
                                                View All <ArrowRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {savedRecipes.length > 0 ? (
                                            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                                                {savedRecipes.map((recipe) => (
                                                    <Link key={recipe.recipeId} href={`/recipes/${recipe.recipeId}`}>
                                                        <div className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                                                            {recipe.recipeImage ? (
                                                                <Image
                                                                    src={recipe.recipeImage}
                                                                    alt={recipe.recipeName}
                                                                    fill
                                                                    className="object-cover transition-transform group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center">
                                                                    <Utensils className="h-8 w-8 text-muted-foreground/50" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                            <p className="absolute bottom-2 left-2 right-2 text-sm font-medium text-white truncate">
                                                                {recipe.recipeName}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                <p className="mt-2 text-muted-foreground">No saved recipes yet</p>
                                                <Button className="mt-4" asChild>
                                                    <Link href="/recipes">Discover Recipes</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Shared Collections */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FolderHeart className="h-5 w-5 text-primary" />
                                                    Shared Collections
                                                </CardTitle>
                                                <CardDescription>Recipes shared with you</CardDescription>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href="/shared-collections">
                                                    View All <ArrowRight className="ml-1 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {collections.length > 0 ? (
                                                <div className="space-y-3">
                                                    {collections.map((collection) => (
                                                        <Link key={collection.id} href={`/shared-collections/${collection.id}`}>
                                                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                                <div>
                                                                    <p className="font-medium">{collection.name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {collection.recipes.length} recipes • {collection.members.length} members
                                                                    </p>
                                                                </div>
                                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <FolderHeart className="mx-auto h-10 w-10 text-muted-foreground/50" />
                                                    <p className="mt-2 text-sm text-muted-foreground">No shared collections yet</p>
                                                    <Button className="mt-4" variant="outline" asChild>
                                                        <Link href="/shared-collections">Create Collection</Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Weekly Stats */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CalendarDays className="h-5 w-5 text-primary" />
                                                This Week
                                            </CardTitle>
                                            <CardDescription>Your weekly summary</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold text-primary">{weeklyStats.mealsPlanned}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Meals Planned</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold text-primary">{weeklyStats.recipesTotal}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Saved Recipes</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold text-primary">{pantryAlerts.length}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Pantry Alerts</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold text-primary">{collections.length}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Collections</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                            </div>

                            <DietaryDialog
                                isOpen={dietModal}
                                closePopup={closeDiet}
                                diets={diets}
                                setDiets={setDiets}
                                intolerances={intolerances}
                                setIntolerances={setIntolerances}
                            />
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    );
}
