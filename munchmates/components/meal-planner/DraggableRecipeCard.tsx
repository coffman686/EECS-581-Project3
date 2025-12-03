// DraggableRecipeCard
// Recipe card element with support for movement via mouse
// - Allows user to move the card around the page
// - Update serving count for a recipe
// - Allows deletion of recipe

'use client';

import { useDraggable } from '@dnd-kit/core';
import { MealPlanEntry } from '@/lib/types/meal-plan';
import { GripVertical, X, Minus, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableRecipeCardProps {
  entry: MealPlanEntry;
  onRemove: () => void;
  onUpdateServings?: (newServings: number) => void;
}

export default function DraggableRecipeCard({
  entry,
  onRemove,
  onUpdateServings,
}: DraggableRecipeCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id,
    data: { entry },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateServings && entry.servings > 1) {
      onUpdateServings(entry.servings - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateServings) {
      onUpdateServings(entry.servings + 1);
    }
  };

  // Check if servings have been modified from original
  const isScaled = entry.originalServings && entry.servings !== entry.originalServings;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-background rounded-lg border overflow-hidden transition-shadow ${
        isDragging ? 'shadow-lg opacity-90 z-50' : 'shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top bar with drag handle and remove button */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-1 bg-gradient-to-b from-black/40 to-transparent z-10">
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/20 rounded touch-none"
          aria-label="Drag to move"
        >
          <GripVertical className="h-4 w-4 text-white drop-shadow" />
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-red-500/80 text-white hover:text-white"
          onClick={onRemove}
          aria-label="Remove recipe"
        >
          <X className="h-3 w-3 drop-shadow" />
        </Button>
      </div>

      {/* Recipe image */}
      {entry.image ? (
        <img
          src={entry.image}
          alt={entry.title}
          className="w-full h-24 object-cover"
        />
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
          <span className="text-3xl">🍽️</span>
        </div>
      )}

      {/* Recipe name and servings */}
      <div className="p-2 space-y-2">
        <p className="text-sm font-medium leading-tight line-clamp-2 text-center">
          {entry.title}
        </p>

        {/* Servings control */}
        {onUpdateServings && (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={handleDecrement}
              disabled={entry.servings <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>

            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs min-w-[60px] justify-center ${
              isScaled ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
            }`}>
              <Users className="h-3 w-3" />
              <span>{entry.servings}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={handleIncrement}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
