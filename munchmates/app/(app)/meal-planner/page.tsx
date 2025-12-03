// Meal Planner Page
// Implements the weekly MunchMates meal planning experience with drag-and-drop,
// persistent storage, and tight integration with the grocery list.
// Features:
// - Week-based meal planning (Mon–Sun) with three slots per day (breakfast, lunch, dinner)
// - Uses `getWeekMonday` + `formatLocalDateStr` to anchor plans to a stable local week start
// - Loads an existing plan from the meal-plan API when authenticated, otherwise falls back
//   to per-week localStorage (`mealPlan-<YYYY-MM-DD>`), creating an empty plan when needed
// - Horizontal layout: days as rows, meal types as columns, with “Today” row visually highlighted
// - Drag-and-drop support via `@dnd-kit/core` to move or swap recipes between meal slots
//   (DraggableRecipeCard + MealSlot + DragOverlay)
// - RecipePickerDialog to add a recipe into one or multiple days for the same meal type
// - Per-entry servings control, preserving original servings for later scaling logic
// - “Save Plan” persists the current week to both localStorage and the `/api/meal-plan` endpoint
// - “Generate Grocery List” aggregates ingredients via `aggregateIngredients(weekPlan)`,
//   stores them in `pending-grocery-items`, and routes to `/grocery-list?fromMealPlan=true`
// - Loading / saving / generating states are surfaced via buttons with spinners and disabled states
// - Fully wrapped in RequireAuth + SidebarProvider + AppSidebar/AppHeader so it matches the
//   overall authenticated app shell and navigation structure.


'use client';

// import all necessary modules and components
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ShoppingCart, Save, Loader2 } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { ensureToken } from '@/lib/keycloak';
import MealSlot from '@/components/meal-planner/MealSlot';
import RecipePickerDialog from '@/components/meal-planner/RecipePickerDialog';
import DraggableRecipeCard from '@/components/meal-planner/DraggableRecipeCard';
import {
  WeeklyMealPlan,
  DayPlan,
  MealPlanEntry,
  MealType,
  createEmptyWeekPlan,
  getWeekMonday,
  generateMealEntryId,
} from '@/lib/types/meal-plan';
import { aggregateIngredients } from '@/lib/ingredient-aggregator';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner']; // may add snacks in the future

// main meal planner component
// handles state, loading/saving, navigation, drag-and-drop, and rendering
const MealPlanner = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [weekPlan, setWeekPlan] = useState<WeeklyMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // ensure current date is set on mount
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // recipe picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dayDate: string; mealType: MealType } | null>(null);

  // drag-and-drop state
  const [activeDragEntry, setActiveDragEntry] = useState<MealPlanEntry | null>(null);

  // format date as YYYY-MM-DD for stable string comparison
  const formatLocalDateStr = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // calculate week start (Monday) string
  const weekMonday = getWeekMonday(currentDate);
  const weekStartStr = formatLocalDateStr(weekMonday);

  // get week range for display
  const getWeekRange = (date: Date) => {
    const start = getWeekMonday(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      start: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fullRange: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
    };
  };

  const weekRange = getWeekRange(currentDate);

  // load meal plan on week change
  useEffect(() => {
    const loadMealPlan = async () => {
      setIsLoading(true);
      try {
        const token = await ensureToken();
        const localKey = `mealPlan-${weekStartStr}`;
        const localData = localStorage.getItem(localKey);

        if (token) {
          const res = await fetch(`/api/meal-plan?weekStart=${weekStartStr}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.plan) {
              setWeekPlan(data.plan);
              localStorage.setItem(localKey, JSON.stringify(data.plan));
              setIsLoading(false);
              return;
            }
          }
        }

        // fallback to localStorage if no API data
        if (localData) {
          setWeekPlan(JSON.parse(localData));
        } else {
          // create empty plan if none exists
          const monday = new Date(weekStartStr + 'T00:00:00');
          setWeekPlan(createEmptyWeekPlan(monday));
        }
      } catch (error) {
        console.error('Failed to load meal plan:', error);
        const monday = new Date(weekStartStr + 'T00:00:00');
        setWeekPlan(createEmptyWeekPlan(monday));
      } finally {
        setIsLoading(false);
      }
    };

    loadMealPlan();
  }, [weekStartStr]);

  // save meal plan function
  const saveMealPlan = async () => {
    if (!weekPlan) return;

    setIsSaving(true);
    try {
      const localKey = `mealPlan-${weekStartStr}`;

      // localStorage save
      localStorage.setItem(localKey, JSON.stringify(weekPlan));

      // API save
      const token = await ensureToken();
      if (token) {
        await fetch('/api/meal-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan: weekPlan }),
        });
      }
    } catch (error) {
      console.error('Failed to save meal plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // week navigation handlers
  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // update day plan entry
  const updateDayPlan = (dayDate: string, mealType: MealType, entry: MealPlanEntry | undefined) => {
    if (!weekPlan) return;

    const newDays = weekPlan.days.map((day) => {
      if (day.date === dayDate) {
        return { ...day, [mealType]: entry };
      }
      return day;
    });

    setWeekPlan({ ...weekPlan, days: newDays });
  };

  // get meal plan entry for a specific day and meal type
  const getEntry = (dayDate: string, mealType: MealType): MealPlanEntry | undefined => {
    if (!weekPlan) return undefined;
    const day = weekPlan.days.find((d) => d.date === dayDate);
    return day?.[mealType];
  };

  // open recipe picker for a specific slot
  const handleAddRecipe = (dayDate: string, mealType: MealType) => {
    setSelectedSlot({ dayDate, mealType });
    setPickerOpen(true);
  };

  // recipe selection handler for multiple days
  const handleSelectRecipe = (
    recipe: { id: number; title: string; image: string; servings: number },
    selectedDays: string[]
  ) => {
    if (!selectedSlot || !weekPlan) return;

    // add recipe to all selected days in the chosen slot
    const newDays = weekPlan.days.map((day) => {
      if (selectedDays.includes(day.date)) {
        const entry: MealPlanEntry = {
          id: generateMealEntryId(),
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          servings: recipe.servings,
          originalServings: recipe.servings,
        };
        return { ...day, [selectedSlot.mealType]: entry };
      }
      return day;
    });

    setWeekPlan({ ...weekPlan, days: newDays });
    setSelectedSlot(null);
  };

  // update servings for a meal slot
  const handleUpdateServings = (dayDate: string, mealType: MealType, newServings: number) => {
    if (!weekPlan || newServings < 1) return;

    const newDays = weekPlan.days.map((day) => {
      if (day.date === dayDate && day[mealType]) {
        return {
          ...day,
          [mealType]: { ...day[mealType], servings: newServings },
        };
      }
      return day;
    });

    setWeekPlan({ ...weekPlan, days: newDays });
  };

  // get available days for recipe picker
  const getAvailableDays = () => {
    if (!weekPlan) return [];
    return weekPlan.days.map((day) => ({
      date: day.date,
      label: new Date(day.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
    }));
  };

  // remove recipe from a meal slot
  const handleRemoveRecipe = (dayDate: string, mealType: MealType) => {
    updateDayPlan(dayDate, mealType, undefined);
  };

  // drag-and-drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const entry = active.data.current?.entry as MealPlanEntry | undefined;
    setActiveDragEntry(entry || null);
  };
 
  // handle drag end to move or swap meal entries
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragEntry(null);

    if (!over || !weekPlan) return;

    const sourceEntry = active.data.current?.entry as MealPlanEntry;
    const targetData = over.data.current as { dayDate: string; mealType: MealType };

    if (!sourceEntry || !targetData) return;

    let sourceDayDate: string | null = null;
    let sourceMealType: MealType | null = null;

    for (const day of weekPlan.days) {
      for (const meal of MEALS) {
        if (day[meal]?.id === sourceEntry.id) {
          sourceDayDate = day.date;
          sourceMealType = meal;
          break;
        }
      }
      if (sourceDayDate) break;
    }

    if (!sourceDayDate || !sourceMealType) return;

    // get target entry
    const targetEntry = getEntry(targetData.dayDate, targetData.mealType);

    // create new days array with updated entries
    const newDays = weekPlan.days.map((day) => {
      const updated: DayPlan = { ...day };

      if (day.date === sourceDayDate) {
        updated[sourceMealType!] = targetEntry; 
      }

      if (day.date === targetData.dayDate) {
        updated[targetData.mealType] = sourceEntry; 
      }

      return updated;
    });

    setWeekPlan({ ...weekPlan, days: newDays });
  };

  // generate grocery list from meal plan
  const handleGenerateGroceryList = async () => {
    if (!weekPlan) return;

    setIsGenerating(true);
    try {
      const aggregated = await aggregateIngredients(weekPlan);
      // store in localStorage for grocery list page
      localStorage.setItem('pending-grocery-items', JSON.stringify(aggregated));
      router.push('/grocery-list?fromMealPlan=true');
    } catch (error) {
      console.error('Failed to generate grocery list:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // check if there are any recipes in the current week plan
  const hasRecipes = weekPlan?.days.some(
    (day) => day.breakfast || day.lunch || day.dinner
  );

  // main render for meal planner page
  // includes sidebar, header, week navigation, meal plan grid, and action buttons
  // also includes drag-and-drop context and recipe picker dialog
  return (
    <RequireAuth>
      <SidebarProvider>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <AppHeader title="Meal Planner" />

              <main className="flex-1 p-6 bg-muted/20">
                <div className="w-full space-y-6">
                  {/* week nav */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={prevWeek}
                          className="flex items-center gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous Week
                        </Button>

                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-foreground">Meal Plan</h2>
                          <p className="text-muted-foreground mt-1">{weekRange.fullRange}</p>
                        </div>

                        <Button
                          variant="outline"
                          onClick={nextWeek}
                          className="flex items-center gap-2"
                        >
                          Next Week
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* meal planning grid */}
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-4">
                        {/* header row */}
                        <div className="hidden sm:flex items-center gap-4 mb-4 pb-3 border-b">
                          <div className="w-28 flex-shrink-0" />
                          {MEALS.map((meal) => (
                            <div key={meal} className="flex-1 text-center">
                              <span className="font-semibold text-sm capitalize">{meal}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          {weekPlan?.days.map((day, dayIndex) => {
                            // added to ensure correct date parsing across timezones
                            const dayDate = new Date(day.date + 'T00:00:00');
                            const today = new Date();
                            const todayStr = formatLocalDateStr(today);
                            const isToday = day.date === todayStr;

                            return (
                              <div
                                key={day.date}
                                className={`flex items-stretch gap-3 p-3 rounded-lg ${
                                  isToday ? 'bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-muted/30'
                                }`}
                              >
                                {/* render day label */}
                                <div className="w-28 flex-shrink-0 flex flex-col justify-center">
                                  <p className="font-bold text-lg">{DAYS[dayIndex]}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {dayDate.toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                  {isToday && (
                                    <span className="text-xs text-primary font-medium mt-1">Today</span>
                                  )}
                                </div>

                                {/* meal slots */}
                                <div className="flex-1 flex gap-4">
                                  {MEALS.map((mealType) => (
                                    <MealSlot
                                      key={mealType}
                                      dayDate={day.date}
                                      mealType={mealType}
                                      entry={getEntry(day.date, mealType)}
                                      onAddRecipe={() => handleAddRecipe(day.date, mealType)}
                                      onRemoveRecipe={() => handleRemoveRecipe(day.date, mealType)}
                                      onUpdateServings={(newServings) => handleUpdateServings(day.date, mealType, newServings)}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* render buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button
                      size="lg"
                      className="flex items-center gap-2 min-w-[200px]"
                      onClick={handleGenerateGroceryList}
                      disabled={!hasRecipes || isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      Generate Grocery List
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2 min-w-[200px]"
                      onClick={saveMealPlan}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Plan
                    </Button>
                  </div>
                </div>
              </main>
            </div>
          </div>

          {/* drag and drop overlay */}
          <DragOverlay>
            {activeDragEntry && (
              <div className="opacity-80">
                <DraggableRecipeCard entry={activeDragEntry} onRemove={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* recipe dialog */}
        <RecipePickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelectRecipe={handleSelectRecipe}
          currentDayDate={selectedSlot?.dayDate || ''}
          availableDays={getAvailableDays()}
        />
      </SidebarProvider>
    </RequireAuth>
  );
};

export default MealPlanner;
