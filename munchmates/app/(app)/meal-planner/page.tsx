'use client';

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
const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];

const MealPlanner = () => {
  const router = useRouter();
  // Initialize with a function to ensure we get the current date at render time
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [weekPlan, setWeekPlan] = useState<WeeklyMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Ensure we're using the current date on client mount
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // Recipe picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dayDate: string; mealType: MealType } | null>(null);

  // Drag state
  const [activeDragEntry, setActiveDragEntry] = useState<MealPlanEntry | null>(null);

  // Compute week Monday and use string for stable dependency
  const weekMonday = getWeekMonday(currentDate);
  const weekStartStr = weekMonday.toISOString().split('T')[0];

  const getWeekRange = (date: Date) => {
    const start = getWeekMonday(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullRange: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
    };
  };

  const weekRange = getWeekRange(currentDate);

  // Load meal plan from API
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

        // Fall back to localStorage
        if (localData) {
          setWeekPlan(JSON.parse(localData));
        } else {
          // Create empty plan for this week
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

  // Save meal plan
  const saveMealPlan = async () => {
    if (!weekPlan) return;

    setIsSaving(true);
    try {
      const localKey = `mealPlan-${weekStartStr}`;

      // Save to localStorage
      localStorage.setItem(localKey, JSON.stringify(weekPlan));

      // Save to API
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

  // Navigation
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

  // Update plan helper
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

  // Get entry from day plan
  const getEntry = (dayDate: string, mealType: MealType): MealPlanEntry | undefined => {
    if (!weekPlan) return undefined;
    const day = weekPlan.days.find((d) => d.date === dayDate);
    return day?.[mealType];
  };

  // Open recipe picker for a slot
  const handleAddRecipe = (dayDate: string, mealType: MealType) => {
    setSelectedSlot({ dayDate, mealType });
    setPickerOpen(true);
  };

  // Recipe selected from picker - now supports multiple days
  const handleSelectRecipe = (
    recipe: { id: number; title: string; image: string; servings: number },
    selectedDays: string[]
  ) => {
    if (!selectedSlot || !weekPlan) return;

    // Add recipe to all selected days for the same meal type
    const newDays = weekPlan.days.map((day) => {
      if (selectedDays.includes(day.date)) {
        const entry: MealPlanEntry = {
          id: generateMealEntryId(),
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          servings: recipe.servings,
          originalServings: recipe.servings, // Store original for scaling
        };
        return { ...day, [selectedSlot.mealType]: entry };
      }
      return day;
    });

    setWeekPlan({ ...weekPlan, days: newDays });
    setSelectedSlot(null);
  };

  // Update servings for a specific meal entry
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

  // Get available days for the picker
  const getAvailableDays = () => {
    if (!weekPlan) return [];
    return weekPlan.days.map((day) => ({
      date: day.date,
      label: new Date(day.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  };

  // Remove recipe from slot
  const handleRemoveRecipe = (dayDate: string, mealType: MealType) => {
    updateDayPlan(dayDate, mealType, undefined);
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const entry = active.data.current?.entry as MealPlanEntry | undefined;
    setActiveDragEntry(entry || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragEntry(null);

    if (!over || !weekPlan) return;

    const sourceEntry = active.data.current?.entry as MealPlanEntry;
    const targetData = over.data.current as { dayDate: string; mealType: MealType };

    if (!sourceEntry || !targetData) return;

    // Find source slot
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

    // Get target entry if exists
    const targetEntry = getEntry(targetData.dayDate, targetData.mealType);

    // Swap or move
    const newDays = weekPlan.days.map((day) => {
      const updated: DayPlan = { ...day };

      if (day.date === sourceDayDate) {
        updated[sourceMealType!] = targetEntry; // Put target in source (swap) or undefined
      }

      if (day.date === targetData.dayDate) {
        updated[targetData.mealType] = sourceEntry; // Put source in target
      }

      return updated;
    });

    setWeekPlan({ ...weekPlan, days: newDays });
  };

  // Generate grocery list
  const handleGenerateGroceryList = async () => {
    if (!weekPlan) return;

    setIsGenerating(true);
    try {
      const aggregated = await aggregateIngredients(weekPlan);

      // Store in localStorage for grocery list page
      localStorage.setItem('pending-grocery-items', JSON.stringify(aggregated));

      // Navigate to grocery list
      router.push('/grocery-list?fromMealPlan=true');
    } catch (error) {
      console.error('Failed to generate grocery list:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if plan has any recipes
  const hasRecipes = weekPlan?.days.some(
    (day) => day.breakfast || day.lunch || day.dinner
  );

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
                  {/* Week Navigation */}
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

                  {/* Meal Plan Grid - Horizontal Rows */}
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-4">
                        {/* Header row with meal type labels */}
                        <div className="hidden sm:flex items-center gap-4 mb-4 pb-3 border-b">
                          <div className="w-28 flex-shrink-0" />
                          {MEALS.map((meal) => (
                            <div key={meal} className="flex-1 text-center">
                              <span className="font-semibold text-sm capitalize">{meal}</span>
                            </div>
                          ))}
                        </div>

                        {/* Days as horizontal rows */}
                        <div className="space-y-4">
                          {weekPlan?.days.map((day, dayIndex) => {
                            // Parse the date string properly to avoid timezone issues
                            const dayDate = new Date(day.date + 'T00:00:00');
                            const today = new Date();
                            const todayStr = today.toISOString().split('T')[0];
                            const isToday = day.date === todayStr;

                            return (
                              <div
                                key={day.date}
                                className={`flex items-stretch gap-3 p-3 rounded-lg ${
                                  isToday ? 'bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-muted/30'
                                }`}
                              >
                                {/* Day label */}
                                <div className="w-28 flex-shrink-0 flex flex-col justify-center">
                                  <p className="font-bold text-lg">{DAYS[dayIndex]}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {dayDate.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                  {isToday && (
                                    <span className="text-xs text-primary font-medium mt-1">Today</span>
                                  )}
                                </div>

                                {/* Meal slots - fills remaining width */}
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

                  {/* Action Buttons */}
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

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDragEntry && (
              <div className="opacity-80">
                <DraggableRecipeCard entry={activeDragEntry} onRemove={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Recipe Picker Dialog */}
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
