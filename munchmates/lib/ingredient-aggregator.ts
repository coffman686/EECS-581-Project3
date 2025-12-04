// file: ingredient-aggregator.ts
// Aggregates ingredients from weekly meal plans together cohesively
// - Fetches recipe ingredient infromation via spoonacular API
// - Standardizes ingredient units across the same items
// - Pools together items by type and category
// - Produces human readable final output with reasonable units

import { WeeklyMealPlan, MealPlanEntry, AggregatedIngredient } from './types/meal-plan';

// ExtendedIngredient type (copied from spoonacular.ts to avoid importing server-side code)
interface ExtendedIngredient {
  id: number;
  aisle: string;
  image: string;
  name: string;
  amount: number;
  unit: string;
  unitShort: string;
  unitLong: string;
  originalString: string;
  metaInformation: string[];
}

interface RecipeInfo {
  title: string;
  extendedIngredients: ExtendedIngredient[];
}

// Fetch recipe information via API route (client-safe)
async function fetchRecipeInfo(recipeId: number): Promise<RecipeInfo | null> {
  try {
    const response = await fetch(`/api/spoonacular/recipes/info?id=${recipeId}`);
    if (!response.ok) {
      console.error(`Failed to fetch recipe ${recipeId}: ${response.status}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching recipe ${recipeId}:`, error);
    return null;
  }
}

// Unit conversion factors to a base unit (for volume: ml, for weight: grams)
const VOLUME_CONVERSIONS: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  tsp: 4.929,
  teaspoon: 4.929,
  teaspoons: 4.929,
  tbsp: 14.787,
  tablespoon: 14.787,
  tablespoons: 14.787,
  cup: 236.588,
  cups: 236.588,
  'fl oz': 29.574,
  'fluid ounce': 29.574,
  'fluid ounces': 29.574,
};

const WEIGHT_CONVERSIONS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

// Normalize unit to lowercase and handle common abbreviations
function normalizeUnit(unit: string): string {
  return unit.toLowerCase().trim();
}

// Check if two units are compatible (same type: volume or weight)
function getUnitType(unit: string): 'volume' | 'weight' | 'count' | 'unknown' {
  const normalized = normalizeUnit(unit);
  if (VOLUME_CONVERSIONS[normalized]) return 'volume';
  if (WEIGHT_CONVERSIONS[normalized]) return 'weight';
  if (!unit || unit === '' || normalized === 'piece' || normalized === 'pieces' ||
      normalized === 'whole' || normalized === 'large' || normalized === 'medium' ||
      normalized === 'small' || normalized === 'clove' || normalized === 'cloves') {
    return 'count';
  }
  return 'unknown';
}

// Convert amount to base unit
function convertToBase(amount: number, unit: string): { amount: number; baseUnit: string } | null {
  const normalized = normalizeUnit(unit);

  if (VOLUME_CONVERSIONS[normalized]) {
    return { amount: amount * VOLUME_CONVERSIONS[normalized], baseUnit: 'ml' };
  }

  if (WEIGHT_CONVERSIONS[normalized]) {
    return { amount: amount * WEIGHT_CONVERSIONS[normalized], baseUnit: 'g' };
  }

  return null;
}

// Convert from base unit to a display unit
function convertFromBase(amount: number, baseUnit: string): { amount: number; unit: string } {
  if (baseUnit === 'ml') {
    if (amount >= 1000) return { amount: amount / 1000, unit: 'L' };
    if (amount >= 236.588) return { amount: amount / 236.588, unit: 'cups' };
    if (amount >= 14.787) return { amount: amount / 14.787, unit: 'tbsp' };
    return { amount: amount / 4.929, unit: 'tsp' };
  }

  if (baseUnit === 'g') {
    if (amount >= 1000) return { amount: amount / 1000, unit: 'kg' };
    if (amount >= 453.592) return { amount: amount / 453.592, unit: 'lbs' };
    if (amount >= 28.3495) return { amount: amount / 28.3495, unit: 'oz' };
    return { amount, unit: 'g' };
  }

  return { amount, unit: baseUnit };
}

// Format amount for display
function formatAmount(amount: number): string {
  if (Number.isInteger(amount)) return amount.toString();

  // Round to 2 decimal places
  const rounded = Math.round(amount * 100) / 100;

  // Convert common decimals to fractions for display
  const fractions: Record<number, string> = {
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.67: '2/3',
    0.75: '3/4',
  };

  const decimal = rounded % 1;
  const whole = Math.floor(rounded);

  for (const [dec, frac] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(dec)) < 0.05) {
      return whole > 0 ? `${whole} ${frac}` : frac;
    }
  }

  return rounded.toString();
}

// Map aisle to a simpler category
function mapAisleToCategory(aisle: string): string {
  const lowerAisle = aisle.toLowerCase();

  if (lowerAisle.includes('produce') || lowerAisle.includes('vegetable') || lowerAisle.includes('fruit')) {
    return 'Produce';
  }
  if (lowerAisle.includes('dairy') || lowerAisle.includes('milk') || lowerAisle.includes('cheese') || lowerAisle.includes('egg')) {
    return 'Dairy';
  }
  if (lowerAisle.includes('meat') || lowerAisle.includes('seafood') || lowerAisle.includes('poultry')) {
    return 'Meat & Seafood';
  }
  if (lowerAisle.includes('bakery') || lowerAisle.includes('bread')) {
    return 'Bakery';
  }
  if (lowerAisle.includes('frozen')) {
    return 'Frozen';
  }
  if (lowerAisle.includes('spice') || lowerAisle.includes('seasoning')) {
    return 'Spices & Seasonings';
  }
  if (lowerAisle.includes('canned') || lowerAisle.includes('jarred')) {
    return 'Canned Goods';
  }
  if (lowerAisle.includes('pasta') || lowerAisle.includes('rice') || lowerAisle.includes('grain')) {
    return 'Pasta & Grains';
  }
  if (lowerAisle.includes('condiment') || lowerAisle.includes('sauce')) {
    return 'Condiments';
  }
  if (lowerAisle.includes('oil') || lowerAisle.includes('vinegar')) {
    return 'Oils & Vinegars';
  }
  if (lowerAisle.includes('baking')) {
    return 'Baking';
  }
  if (lowerAisle.includes('beverage') || lowerAisle.includes('drink')) {
    return 'Beverages';
  }

  return 'Pantry';
}

export async function aggregateIngredients(weekPlan: WeeklyMealPlan): Promise<AggregatedIngredient[]> {
  // Collect all recipe IDs from the week plan
  const recipeEntries: MealPlanEntry[] = [];

  for (const day of weekPlan.days) {
    if (day.breakfast) recipeEntries.push(day.breakfast);
    if (day.lunch) recipeEntries.push(day.lunch);
    if (day.dinner) recipeEntries.push(day.dinner);
  }

  if (recipeEntries.length === 0) {
    return [];
  }

  // Fetch full recipe information for each recipe via API route
  const uniqueRecipeIds = [...new Set(recipeEntries.map((e) => e.recipeId))];
  const recipeInfoMap = new Map<number, { ingredients: ExtendedIngredient[]; title: string }>();

  await Promise.all(
    uniqueRecipeIds.map(async (recipeId) => {
      const info = await fetchRecipeInfo(recipeId);
      if (info) {
        recipeInfoMap.set(recipeId, {
          ingredients: info.extendedIngredients || [],
          title: info.title,
        });
      }
    })
  );

  // Aggregate ingredients
  const aggregated = new Map<string, {
    name: string;
    amounts: { amount: number; unit: string; unitType: string }[];
    category: string;
    sourceRecipes: Set<string>;
  }>();

  for (const entry of recipeEntries) {
    const recipeInfo = recipeInfoMap.get(entry.recipeId);
    if (!recipeInfo) continue;

    // Calculate serving multiplier based on user's desired servings vs recipe's original servings
    // entry.servings = user's desired servings for this meal
    // entry.originalServings = recipe's default servings (from Spoonacular)
    const originalServings = entry.originalServings || 1;
    const desiredServings = entry.servings || originalServings;
    const servingMultiplier = desiredServings / originalServings;

    for (const ingredient of recipeInfo.ingredients) {
      const key = ingredient.name.toLowerCase().trim();
      const adjustedAmount = (ingredient.amount || 0) * servingMultiplier;
      const unit = ingredient.unit || '';
      const unitType = getUnitType(unit);
      const category = mapAisleToCategory(ingredient.aisle || 'Pantry');

      if (!aggregated.has(key)) {
        aggregated.set(key, {
          name: ingredient.name,
          amounts: [],
          category,
          sourceRecipes: new Set(),
        });
      }

      const existing = aggregated.get(key)!;
      existing.amounts.push({ amount: adjustedAmount, unit, unitType });
      existing.sourceRecipes.add(entry.title);
    }
  }

  // Convert to final format with combined amounts
  const result: AggregatedIngredient[] = [];

  for (const [, data] of aggregated) {
    // Group amounts by unit type
    const volumeAmounts: number[] = [];
    const weightAmounts: number[] = [];
    const countAmounts: { amount: number; unit: string }[] = [];
    const otherAmounts: { amount: number; unit: string }[] = [];

    for (const { amount, unit, unitType } of data.amounts) {
      if (unitType === 'volume') {
        const converted = convertToBase(amount, unit);
        if (converted) volumeAmounts.push(converted.amount);
      } else if (unitType === 'weight') {
        const converted = convertToBase(amount, unit);
        if (converted) weightAmounts.push(converted.amount);
      } else if (unitType === 'count') {
        countAmounts.push({ amount, unit });
      } else {
        otherAmounts.push({ amount, unit });
      }
    }

    // Combine and convert back
    let totalAmount = 0;
    let finalUnit = '';

    if (volumeAmounts.length > 0) {
      const total = volumeAmounts.reduce((a, b) => a + b, 0);
      const converted = convertFromBase(total, 'ml');
      totalAmount = converted.amount;
      finalUnit = converted.unit;
    } else if (weightAmounts.length > 0) {
      const total = weightAmounts.reduce((a, b) => a + b, 0);
      const converted = convertFromBase(total, 'g');
      totalAmount = converted.amount;
      finalUnit = converted.unit;
    } else if (countAmounts.length > 0) {
      totalAmount = countAmounts.reduce((sum, c) => sum + c.amount, 0);
      finalUnit = countAmounts[0]?.unit || '';
    } else if (otherAmounts.length > 0) {
      // Can't combine different unknown units, just take the first
      totalAmount = otherAmounts[0].amount;
      finalUnit = otherAmounts[0].unit;
    }

    result.push({
      name: data.name,
      totalAmount: parseFloat(formatAmount(totalAmount)),
      unit: finalUnit,
      category: data.category,
      sourceRecipes: Array.from(data.sourceRecipes),
    });
  }

  // Sort by category then name
  result.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return result;
}
