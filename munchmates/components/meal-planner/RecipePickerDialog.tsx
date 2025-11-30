'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Clock, Users, ChefHat, Loader2, ArrowLeft, Check } from 'lucide-react';
import { getDiets, getIntolerances } from '@/components/ingredients/Dietary';

interface Recipe {
  id: number;
  title: string;
  image: string;
  score: number;
  servings: number;
  readyInMinutes: number;
  cuisines: string[];
  dishTypes: string[];
}

interface RecipePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRecipe: (recipe: Recipe, selectedDays: string[]) => void;
  currentDayDate: string;
  availableDays: { date: string; label: string }[];
}

const dishTypes = [
  'All',
  'main course',
  'side dish',
  'dessert',
  'appetizer',
  'salad',
  'bread',
  'breakfast',
  'soup',
  'beverage',
  'snack',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RecipePickerDialog({
  open,
  onOpenChange,
  onSelectRecipe,
  currentDayDate,
  availableDays,
}: RecipePickerDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDishType, setSelectedDishType] = useState('All');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Day selection state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const fetchRecipes = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);

    const diet = getDiets();
    const intolerances = getIntolerances();
    const dishType = selectedDishType !== 'All' ? selectedDishType : undefined;

    try {
      const response = await fetch(
        `/api/spoonacular/recipes/searchByIngredient?ingredients=${encodeURIComponent(query)}&dishType=${dishType || ''}&diet=${diet}&intolerances=${intolerances}`
      );
      const data = await response.json();
      setRecipes(data.results || []);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchRecipes(searchTerm.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setSelectedDays([currentDayDate]); // Default to current day
  };

  const handleBackToSearch = () => {
    setSelectedRecipe(null);
    setSelectedDays([]);
  };

  const handleDayToggle = (dayDate: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayDate)
        ? prev.filter((d) => d !== dayDate)
        : [...prev, dayDate]
    );
  };

  const handleSelectAll = () => {
    if (selectedDays.length === availableDays.length) {
      setSelectedDays([currentDayDate]); // Reset to just current day
    } else {
      setSelectedDays(availableDays.map((d) => d.date));
    }
  };

  const handleConfirm = () => {
    if (selectedRecipe && selectedDays.length > 0) {
      onSelectRecipe(selectedRecipe, selectedDays);
      onOpenChange(false);
      resetState();
    }
  };

  const resetState = () => {
    setSearchTerm('');
    setSelectedDishType('All');
    setRecipes([]);
    setHasSearched(false);
    setSelectedRecipe(null);
    setSelectedDays([]);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  // Day selection view
  if (selectedRecipe) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Days</DialogTitle>
            <DialogDescription>
              Choose which days to add this recipe
            </DialogDescription>
          </DialogHeader>

          {/* Selected recipe preview */}
          <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
            {selectedRecipe.image ? (
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                className="w-20 h-20 rounded-md object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-md bg-primary/20 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-medium leading-tight">{selectedRecipe.title}</h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedRecipe.readyInMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selectedRecipe.servings} servings
                </span>
              </div>
            </div>
          </div>

          {/* Day selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Select Days</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedDays.length === availableDays.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableDays.map((day, index) => {
                const isSelected = selectedDays.includes(day.date);
                const isCurrent = day.date === currentDayDate;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => handleDayToggle(day.date)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left ${
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50 border-border'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/40'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{DAYS_OF_WEEK[index]}</p>
                      <p className="text-xs text-muted-foreground">{day.label}</p>
                    </div>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        Current
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleBackToSearch}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleConfirm} disabled={selectedDays.length === 0}>
              Add to {selectedDays.length} Day{selectedDays.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Search view
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Recipe to Meal Plan</DialogTitle>
          <DialogDescription>
            Search for recipes by ingredients or name
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by ingredients (e.g., chicken, rice)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <select
              value={selectedDishType}
              onChange={(e) => setSelectedDishType(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {dishTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Searching recipes...</p>
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-muted">
                    <img
                      src={recipe.image || '/placeholder-recipe.png'}
                      alt={recipe.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2">
                      {recipe.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {recipe.dishTypes?.slice(0, 2).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.readyInMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{recipe.servings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No recipes found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try different ingredients or filters
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Enter ingredients to search</p>
              <p className="text-sm text-muted-foreground mt-1">
                e.g., &quot;chicken, broccoli&quot; or &quot;pasta&quot;
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
