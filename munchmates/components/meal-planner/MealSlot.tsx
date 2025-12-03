// MealSlot.tsx
// Container for recipe elements on meal plan view
// - Holds a draggable recipe or empty slot
// - Allows user to add a new recipe to the list
// - Existing recipes can be dropped into an empty slot
// - Currently holds 3 time slots for meals

'use client';

import { useDroppable } from '@dnd-kit/core';
import { MealPlanEntry, MealType } from '@/lib/types/meal-plan';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DraggableRecipeCard from './DraggableRecipeCard';

interface MealSlotProps {
  dayDate: string;
  mealType: MealType;
  entry?: MealPlanEntry;
  onAddRecipe: () => void;
  onRemoveRecipe: () => void;
  onUpdateServings?: (newServings: number) => void;
}

export default function MealSlot({
  dayDate,
  mealType,
  entry,
  onAddRecipe,
  onRemoveRecipe,
  onUpdateServings,
}: MealSlotProps) {
  const droppableId = `${dayDate}-${mealType}`;

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { dayDate, mealType },
  });

  const mealLabels: Record<MealType, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
  };

  return (
    <div className="flex-1 flex flex-col min-w-[160px]">
      <h4 className="font-medium text-xs mb-1 text-muted-foreground text-center sm:hidden">
        {mealLabels[mealType]}
      </h4>
      <div
        ref={setNodeRef}
        className={`flex-1 border-2 border-dashed rounded-lg p-3 transition-colors ${
          isOver
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/20 hover:border-muted-foreground/40'
        }`}
      >
        {entry ? (
          <DraggableRecipeCard
            entry={entry}
            onRemove={onRemoveRecipe}
            onUpdateServings={onUpdateServings}
          />
        ) : (
          <div className="h-full min-h-[160px] flex items-center justify-center bg-muted/30 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1 text-xs h-auto py-3"
              onClick={onAddRecipe}
            >
              <Plus className="h-6 w-6" />
              <span>Add Recipe</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
