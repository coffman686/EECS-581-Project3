// Meal plan type definitions

export interface MealPlanEntry {
  id: string;
  recipeId: number;
  title: string;
  image?: string;
  servings: number;         // User's desired servings
  originalServings: number; // Recipe's default servings (from Spoonacular)
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface DayPlan {
  date: string; // ISO date string (YYYY-MM-DD)
  breakfast?: MealPlanEntry;
  lunch?: MealPlanEntry;
  dinner?: MealPlanEntry;
}

export interface WeeklyMealPlan {
  weekStart: string; // ISO date of Monday
  days: DayPlan[];
}

export interface AggregatedIngredient {
  name: string;
  totalAmount: number;
  unit: string;
  category: string;
  sourceRecipes: string[];
}

// Format date as YYYY-MM-DD in local timezone (avoids UTC shift issues)
function formatLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to create an empty week plan
export function createEmptyWeekPlan(weekStart: Date): WeeklyMealPlan {
  const days: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    days.push({
      date: formatLocalDateStr(date),
    });
  }
  return {
    weekStart: formatLocalDateStr(weekStart),
    days,
  };
}

// Helper to get Monday of the week for a given date
// If today is Sunday, show the upcoming week (next Monday)
export function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();

  // If Sunday (day === 0), get next Monday (add 1 day)
  // Otherwise, get the Monday of the current week
  if (day === 0) {
    d.setDate(d.getDate() + 1);
  } else {
    const diff = d.getDate() - day + 1;
    d.setDate(diff);
  }

  d.setHours(0, 0, 0, 0);
  return d;
}

// Generate unique ID for meal entries
export function generateMealEntryId(): string {
  return `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
