# spoonacular API setup guide

use this guide to get Spoonacular set up and understand how to use the API Endpoints

## step 1: get your API Key (if you don't already have one)

1. go to [spoonacular API signup](https://spoonacular.com/food-api/console/#Dashboard)
2. either create account or sign in if you already have an account
3. go to the profile & API Key tab
4. copy your API key

### free teir usage (for now)

- for now we are using the free teir of Spoonacular which gives you 50 points a day
- this should be enough for testing
- there is a $10 a month plan for students if we need more points per day during testing stages

---

## step 2: local setup

### if first time cloning repo --> copy enviornment file

```bash
# use this command to copy enviorment key
cp .env.local.example .env.local
```

### if already have env file --> update it to have key

```bash
# add this line to .env.local file
SPOONACULAR_API_KEY=your_actual_api_key_here
```

### then, add Your API Key

```bash
# replace with actual key from website
SPOONACULAR_API_KEY=your_actual_api_key_here
```

### 3. restart Next.js server after adding your key

```bash
npm run dev:all
```

---

## api key in code

### server side (API routes)

API client can only be used server side, because it requires the API key

example usage:

```typescript
// app/api/recipes/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchRecipes } from "@/lib/spoonacular";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "pasta";

    const results = await searchRecipes(query, {
      number: 10,
      addRecipeInformation: true,
    });

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search recipes" },
      { status: 500 }
    );
  }
}
```

### client side

from your React components, call your API routes:

```typescript
// app/(app)/recipes/page.tsx
'use client';

import { useState } from 'react';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);

  const searchRecipes = async (query: string) => {
    const response = await fetch(`/api/recipes/search?query=${query}`);
    const data = await response.json();
    setRecipes(data.results);
  };

  return (
    // Your UI here
  );
}
```

---

## functions available with current implementation

found in spoonacular client (`lib/spoonacular.ts`):

### recipe functions

```typescript
import {
  searchRecipes,
  getRecipeInformation,
  getRandomRecipes,
  searchRecipesByIngredients,
  getSimilarRecipes,
} from "@/lib/spoonacular";

// Search recipes by query
const results = await searchRecipes("pasta", {
  cuisine: "italian",
  diet: "vegetarian",
  number: 10,
});

// Get detailed recipe info
const recipe = await getRecipeInformation(716429);

// Get random recipes
const random = await getRandomRecipes({
  number: 5,
  tags: "vegetarian,dessert",
});

// Search by ingredients
const recipes = await searchRecipesByIngredients("chicken,rice,tomato", {
  number: 10,
});

// Get similar recipes
const similar = await getSimilarRecipes(716429, 5);
```

### utilizing ingredient functions

```typescript
import { searchIngredients, getIngredientInformation } from "@/lib/spoonacular";

// Search ingredients
const ingredients = await searchIngredients("chicken", {
  number: 10,
});

// Get ingredient details
const ingredient = await getIngredientInformation(9266, 1, "cup");
```

### generating meal plan

```typescript
import { generateMealPlan } from "@/lib/spoonacular";

// Generate a meal plan
const mealPlan = await generateMealPlan({
  timeFrame: "day",
  targetCalories: 2000,
  diet: "vegetarian",
});
```

### getting nutrition

```typescript
import { getRecipeNutrition } from "@/lib/spoonacular";

// Get nutrition info
const nutrition = await getRecipeNutrition(716429);
```

### getting images

```typescript
import { getRecipeImageUrl, getIngredientImageUrl } from "@/lib/spoonacular";

// Get full image URLs
const recipeImage = getRecipeImageUrl("recipe-image.jpg", "480x360");
const ingredientImage = getIngredientImageUrl("chicken.jpg", "250x250");
```

---

## .ts types

all functions include .ts types, use as needed:

```typescript
import type {
  Recipe,
  RecipeInformation,
  SearchRecipesResult,
  Ingredient,
  ExtendedIngredient,
  NutritionInfo,
} from "@/lib/spoonacular";
```

---

## possible solutions for going over API call limit

1. **caching results** to reduce calls when possible
2. **using batch operations** instead of multiple single requests

### example for handling rate limits

```typescript
try {
  const results = await searchRecipes("pasta");
} catch (error) {
  if (error.message.includes("402")) {
    // Rate limit exceeded
    console.error("API rate limit exceeded. Try again tomorrow.");
  }
}
```

---

## troubleshooting

### "SPOONACULAR_API_KEY is not set in environment variables"

**double check:**

1. make sure you created `.env.local` file
2. add `SPOONACULAR_API_KEY=your_key_here`
3. restart your dev server

### "API error (401): Unauthorized"

**double check:**

- your API key exists
- the key in your `.env.local` is correct
- verify the key works in the Spoonacular dashboard

### "API error (402): Payment Required"

**solution:**

- wait until tomorrow to test more
- if this becomes an issue, reach out to me and we can come up with a plan
- probably have to buy the $10 student plan at some point

## spoonacular documentation

- [Spoonacular API Documentation](https://spoonacular.com/food-api/docs)
