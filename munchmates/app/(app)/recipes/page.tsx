'use client';

import { useState, useEffect, SetStateAction } from 'react';
import DynamicList from '@/components/ingredients/DynamicList';
import Autosuggest from '@/components/ingredients/Autosuggest';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { authedFetch } from '@/lib/authedFetch';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Plus, Clock, Users, ChefHat, Filter, Star, Heart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getDiets, getIntolerances } from '@/components/ingredients/Dietary';

// Ingredient data for autosuggest (same as DynamicList)
const ingredientData = [
    // Produce - Fruits
    "Apple", "Banana", "Orange", "Lemon", "Lime", "Grapefruit", "Strawberry", "Blueberry",
    "Raspberry", "Blackberry", "Grape", "Watermelon", "Cantaloupe", "Honeydew", "Pineapple",
    "Mango", "Peach", "Nectarine", "Plum", "Pear", "Kiwi", "Pomegranate", "Cherry", "Apricot",
    "Cranberry", "Fig", "Date",
    // Produce - Vegetables
    "Broccoli", "Cauliflower", "Carrot", "Celery", "Cucumber", "Zucchini", "Yellow Squash",
    "Butternut Squash", "Acorn Squash", "Pumpkin", "Sweet Potato", "Russet Potato", "Red Potato",
    "Yukon Gold Potato", "Onion", "Red Onion", "Yellow Onion", "White Onion", "Green Onion",
    "Shallot", "Garlic", "Ginger", "Bell Pepper", "Red Bell Pepper", "Yellow Bell Pepper",
    "Green Bell Pepper", "Orange Bell Pepper", "Jalapeño", "Serrano Pepper", "Habanero Pepper",
    "Poblano Pepper", "Tomato", "Cherry Tomato", "Grape Tomato", "Roma Tomato", "Spinach",
    "Kale", "Romaine Lettuce", "Iceberg Lettuce", "Mixed Greens", "Arugula", "Cabbage",
    "Red Cabbage", "Brussels Sprouts", "Asparagus", "Green Beans", "Snow Peas", "Snap Peas",
    "Mushroom", "Portobello Mushroom", "Cremini Mushroom", "White Mushroom", "Eggplant", "Beet",
    "Radish", "Leek", "Fennel", "Corn",
    // Fresh Herbs
    "Basil", "Cilantro", "Parsley", "Oregano", "Thyme", "Rosemary", "Sage", "Dill", "Mint",
    "Chives", "Tarragon",
    // Meat & Poultry
    "Chicken Breast", "Chicken Thigh", "Whole Chicken", "Ground Chicken", "Beef Steak",
    "Ground Beef", "Pork Chop", "Pork Tenderloin", "Ground Pork", "Bacon", "Sausage",
    "Lamb Chop", "Ground Lamb", "Duck Breast", "Ground Turkey", "Turkey Breast",
    // Seafood
    "Salmon", "Tuna", "Cod", "Tilapia", "Halibut", "Shrimp", "Crab", "Lobster", "Mussels",
    "Clams", "Oysters", "Squid", "Scallops", "Anchovies",
    // Dairy
    "Milk", "Whole Milk", "Skim Milk", "Butter", "Cream", "Heavy Cream", "Sour Cream",
    "Whipped Cream", "Cheese", "Cheddar Cheese", "Mozzarella Cheese", "Parmesan Cheese",
    "Swiss Cheese", "Feta Cheese", "Cream Cheese", "Gouda Cheese", "Brie", "Eggs", "Yogurt",
    "Greek Yogurt",
    // Bread & Grains
    "Rice", "White Rice", "Brown Rice", "Basmati Rice", "Jasmine Rice", "Arborio Rice",
    "Wild Rice", "Quinoa", "Couscous", "Oats", "Oatmeal", "Barley", "Wheat Berries",
    "White Bread", "Whole Wheat Bread", "Sourdough Bread", "Bagel", "Tortilla", "Flour Tortilla",
    "Corn Tortilla", "Pita Bread", "Naan", "Hamburger Bun", "Hot Dog Bun", "Spaghetti",
    "Penne", "Macaroni", "Fettuccine", "Lasagna Noodles", "Egg Noodles", "Ramen Noodles",
    "Rice Noodles", "Udon Noodles",
    // Baking & Pantry Basics
    "All-Purpose Flour", "Whole Wheat Flour", "Bread Flour", "Cornmeal", "Baking Powder",
    "Baking Soda", "Yeast", "Granulated Sugar", "Brown Sugar", "Powdered Sugar", "Honey",
    "Maple Syrup", "Agave Nectar", "Vanilla Extract", "Cocoa Powder", "Chocolate Chips",
    // Canned & Jarred
    "Canned Tomatoes", "Diced Tomatoes", "Tomato Sauce", "Tomato Paste", "Crushed Tomatoes",
    "Canned Corn", "Canned Black Beans", "Canned Pinto Beans", "Canned Kidney Beans",
    "Canned Chickpeas", "Canned Lentils", "Canned Tuna", "Canned Salmon", "Canned Coconut Milk",
    "Marinara Sauce", "Salsa", "Peanut Butter", "Almond Butter", "Jam", "Jelly", "Pickle", "Olives",
    // Oils, Vinegars & Condiments
    "Olive Oil", "Extra Virgin Olive Oil", "Vegetable Oil", "Canola Oil", "Avocado Oil",
    "Sesame Oil", "Soy Sauce", "Tamari", "Fish Sauce", "Oyster Sauce", "Worcestershire Sauce",
    "Hot Sauce", "Sriracha", "Ketchup", "Mustard", "Dijon Mustard", "Mayonnaise", "BBQ Sauce",
    "Ranch Dressing", "Vinaigrette", "Balsamic Vinegar", "Red Wine Vinegar", "White Wine Vinegar",
    "Rice Vinegar", "Apple Cider Vinegar",
    // Spices & Seasonings
    "Salt", "Sea Salt", "Kosher Salt", "Black Pepper", "White Pepper", "Paprika", "Smoked Paprika",
    "Cayenne Pepper", "Chili Powder", "Cumin", "Coriander", "Turmeric", "Curry Powder",
    "Garlic Powder", "Onion Powder", "Italian Seasoning", "Herbes De Provence", "Dried Oregano",
    "Dried Basil", "Dried Thyme", "Dried Rosemary", "Red Pepper Flakes", "Cinnamon", "Nutmeg",
    "Cloves", "Ground Ginger", "Allspice",
    // Legumes, Nuts & Seeds
    "Lentils", "Green Lentils", "Red Lentils", "Black Beans", "Pinto Beans", "Kidney Beans",
    "Chickpeas", "White Beans", "Cannellini Beans", "Edamame", "Peanuts", "Almonds", "Walnuts",
    "Cashews", "Pistachios", "Pumpkin Seeds", "Sunflower Seeds", "Chia Seeds", "Flaxseed", "Hemp Seeds",
    // Snacks & Misc
    "Granola", "Cereal", "Crackers", "Pretzels", "Popcorn Kernels", "Tortilla Chips",
    "Potato Chips", "Hummus", "Guacamole",
    // Beverages / Stocks
    "Water", "Sparkling Water", "Orange Juice", "Apple Juice", "Lemon Juice", "Lime Juice",
    "Coffee", "Espresso", "Tea", "Green Tea", "Black Tea", "Herbal Tea", "Broth", "Chicken Broth",
    "Beef Broth", "Vegetable Broth",
];

type Recipe = {
    id: number;
    title: string;
    image: string;
    score: number;
    servings: number;
    readyInMinutes: number;
    cuisines: string[];
    dishTypes: string[];
}



type NewRecipeForm = {
    title: string;
    servings: number;
    readyInMinutes: number;
    dishType: string;
    cuisine: string;
    ingredients: string[];
    instructions: string;
}



const Recipes = () => {

    const router = useRouter();

    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const [selectedDishType, setSelectedDishType] = useState('All');

    const [selectedCuisine, setSelectedCuisine] = useState('All');

    const [diet, setDiet] = useState("");

    const [intolerances, setIntolerances] = useState("");



    const dishTypes = ['All', 'main course', 'side dish', 'dessert', 'appetizer', 'salad', 'bread', 'breakfast', 'soup', 'beverage', 'sauce', 'marinade', 'fingerfood', 'snack', 'drink'];

    const cuisines = ['All', 'African', 'Asian', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese', 'Eastern European', 'European', 'French', 'German', 'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American', 'Mediterranean', 'Mexican', 'Middle Eastern', 'Nordic', 'Southern', 'Spanish', 'Thai', 'Vietnamese'];



    const fetchRecipes = async () => {
        if (!searchTerm) {
            setRecipes([]);
            return;
        }

        setIsLoading(true);

        const params = new URLSearchParams();
        params.set('ingredients', searchTerm);
        if (selectedCuisine !== 'All') params.set('cuisine', selectedCuisine);
        if (selectedDishType !== 'All') params.set('dishType', selectedDishType);
        if (diet) params.set('diet', diet);
        if (intolerances) params.set('intolerances', intolerances);

        try {
            const response = await fetch(`/api/spoonacular/recipes/searchByIngredient?${params.toString()}`);
            const data = await response.json();
            setRecipes(data.results || []);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    }



    useEffect(() => {

        setDiet(getDiets())

        setIntolerances(getIntolerances())

    }, []);



    useEffect(() => {

        fetchRecipes()

    }, [searchTerm, selectedCuisine, selectedDishType, diet, intolerances])



    const handleSearch = async () => {

        const ingredientListString = ingredientList.join(',').toLowerCase();

        setDiet(getDiets());

        setIntolerances(getIntolerances());

        setSearchTerm(ingredientListString);

    };



    const [ingredientList, setIngredientList] = useState<string[]>([]);

    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const [recipeFormData, setRecipeFormData] = useState<NewRecipeForm>({

        title: '',

        servings: 1,

        readyInMinutes: 30,

        dishType: 'main course',

        cuisine: 'American',

        ingredients: [],

        instructions: '',

    });

    const [newIngredient, setNewIngredient] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [savedRecipeIds, setSavedRecipeIds] = useState<Set<number>>(new Set());



    // Load saved recipes on mount
    useEffect(() => {
        const loadSavedRecipes = async () => {
            try {
                const response = await authedFetch('/api/recipes/saved');
                if (response.ok) {
                    const data = await response.json();
                    setSavedRecipeIds(new Set(data.recipes.map((r: any) => r.recipeId)));
                }
            } catch (error) {
                console.error('Error loading saved recipes:', error);
            }
        };
        loadSavedRecipes();
    }, []);

    const handleAddIngredient = () => {
        if (newIngredient.trim()) {
            setRecipeFormData(prev => ({
                ...prev,
                ingredients: [...prev.ingredients, newIngredient.trim()]
            }));
            setNewIngredient('');
        }
    };

    const handleRemoveIngredient = (index: number) => {
        setRecipeFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const handleCreateRecipe = async () => {
        // Validate required fields
        if (!recipeFormData.title.trim()) {
            alert('Recipe title is required');
            return;
        }
        if (recipeFormData.ingredients.length === 0) {
            alert('At least one ingredient is required');
            return;
        }
        if (!recipeFormData.instructions.trim()) {
            alert('Instructions are required');
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare the recipe data
            const newRecipeData = {
                title: recipeFormData.title,
                servings: recipeFormData.servings,
                readyInMinutes: recipeFormData.readyInMinutes,
                dishTypes: [recipeFormData.dishType],
                cuisines: [recipeFormData.cuisine],
                ingredients: recipeFormData.ingredients,
                instructions: recipeFormData.instructions,
                createdAt: new Date().toISOString(),
            };

            // Send to API to create recipe
            const response = await authedFetch('/api/recipes/create', {
                method: 'POST',
                body: JSON.stringify(newRecipeData),
            });

            if (!response.ok) {
                throw new Error('Failed to create recipe');
            }

            const data = await response.json();
            console.log('Recipe created successfully:', data);
            // Close dialog and reset form
            setShowCreateDialog(false);
            setRecipeFormData({
                title: '',
                servings: 1,
                readyInMinutes: 30,
                dishType: 'main course',
                cuisine: 'American',
                ingredients: [],
                instructions: '',
            });
            // Navigate to the newly created recipe
            if (data.id) {
                router.push(`/recipes/${data.id}`);
            }
        } catch (error) {
            console.error('Error creating recipe:', error);
            alert('Failed to create recipe. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const createNewRecipe = () => {
        setShowCreateDialog(true);
    };

    const handleSaveRecipe = async (recipeId: number, recipeName: string) => {
        try {
            const response = await authedFetch('/api/recipes/saved', {
                method: 'POST',
                body: JSON.stringify({
                    recipeId,
                    recipeName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save recipe');
            }

            // Update saved recipes state
            setSavedRecipeIds(prev => new Set([...prev, recipeId]));
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Failed to save recipe. Please try again.');
        }
    };

    const handleRemoveSavedRecipe = async (recipeId: number) => {
        try {
            const response = await authedFetch(`/api/recipes/saved?recipeId=${recipeId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove recipe');
            }

            // Update saved recipes state
            setSavedRecipeIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(recipeId);
                return newSet;
            });
        } catch (error) {
            console.error('Error removing saved recipe:', error);
            alert('Failed to remove recipe. Please try again.');
        }
    };

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title="Recipes" />
                        <main className="flex-1 p-6 bg-muted/20">
                            <div className="max-w-7xl mx-auto space-y-6">
                                {/* Header with Search and Create */}
                                {/* Header with Search and Create */}
                                <DynamicList
                                    ingredients={ingredientList}
                                    setIngredients={setIngredientList}
                                >
                                    <Button
                                        type="button"
                                        onClick={handleSearch}
                                        className="inline-flex items-center gap-2"
                                    >
                                        <Search className="h-4 w-4" />
                                        Search Recipes
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={createNewRecipe}
                                        className="inline-flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New Recipe
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={() => router.push('/recipes/saved')}
                                        className="inline-flex items-center gap-2"
                                        variant="outline"
                                    >
                                        <Heart className="h-4 w-4" />
                                        Saved Recipes
                                    </Button>
                                </DynamicList>


                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Filter by:</span>
                                    </div>
                                    <Select
                                        value={selectedDishType}
                                        onValueChange={(value: SetStateAction<string>) => setSelectedDishType(value)}
                                    >
                                        <SelectTrigger className="w-full max-w-xs rounded-full">
                                            <SelectValue placeholder="Dish type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dishTypes.map((dishType) => (
                                                <SelectItem key={dishType} value={dishType}>
                                                    {dishType.charAt(0).toUpperCase() + dishType.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={selectedCuisine}
                                        onValueChange={(value: SetStateAction<string>) => setSelectedCuisine(value)}
                                    >
                                        <SelectTrigger className="w-full max-w-xs rounded-full">
                                            <SelectValue placeholder="Cuisine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cuisines.map((cuisine) => (
                                                <SelectItem key={cuisine} value={cuisine}>
                                                    {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>
                                {/* Recipe Grid */}
                                {recipes && recipes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {recipes.map(recipe => (
                                            <Card key={recipe.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                                <div className="h-48 bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                                                    <img
                                                        src={recipe.image || '/placeholder-recipe.png'}
                                                        alt={recipe.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <CardHeader className="pb-3 flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <CardTitle className="text-lg leading-tight">
                                                            {recipe.title}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span>{recipe.score}</span>
                                                        </div>
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {recipe.dishTypes.map(dishType => (
                                                            dishTypes.includes(dishType) &&
                                                            <Badge key={dishType} className="mr-1">
                                                                {dishType.charAt(0).toUpperCase() + dishType.slice(1)}
                                                            </Badge>
                                                        ))}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pb-3">
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {recipe.cuisines.length > 0 ? recipe.cuisines.map(cuisine => (
                                                            cuisines.includes(cuisine) &&
                                                            <Badge key={cuisine} variant="secondary">
                                                                {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                                                            </Badge>
                                                        )) : (
                                                            null)
                                                        }
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{recipe.readyInMinutes} min</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{recipe.servings} servings</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button
                                                        onClick={() => router.push(`/recipes/${recipe.id}`)}
                                                        className="w-full flex-1"
                                                    >
                                                        View Recipe
                                                    </Button>
                                                    <Button
                                                        onClick={() => savedRecipeIds.has(recipe.id)
                                                            ? handleRemoveSavedRecipe(recipe.id)
                                                            : handleSaveRecipe(recipe.id, recipe.title)
                                                        }
                                                        variant={savedRecipeIds.has(recipe.id) ? "default" : "outline"}
                                                        size="icon"
                                                        className="ml-2"
                                                    >
                                                        <Heart
                                                            className={`h-4 w-4 ${savedRecipeIds.has(recipe.id) ? 'fill-current' : ''}`}
                                                        />
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="text-center py-12">
                                        <CardContent>
                                            {isLoading && (
                                                <div>
                                                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                                                    <h3 className="text-lg font-semibold mb-2">
                                                        Loading recipes...
                                                    </h3>
                                                </div>
                                            )}
                                            {searchTerm && (selectedDishType !== 'All' || selectedCuisine !== 'All') && !isLoading && (
                                                <div>
                                                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                                                    <h3 className="text-lg font-semibold mb-2">
                                                        No recipes found
                                                    </h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Try adjusting your search or filters
                                                    </p>
                                                </div>
                                            )}
                                            {!searchTerm && !isLoading && (
                                                <div>
                                                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                                                    <h3 className="text-lg font-semibold mb-2">
                                                        Search for a recipe to get started
                                                    </h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Enter in ingredients above to find recipe suggestions or create your own recipe
                                                    </p>
                                                    <Button
                                                        onClick={createNewRecipe}
                                                        className="flex items-center gap-2 mx-auto"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Create Your First Recipe
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                                {/* Stats */}
                                {recipes && recipes.length > 0 ? (
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                <div>
                                                    <p className="text-2xl font-bold text-primary">{recipes.length}</p>
                                                    <p className="text-sm text-muted-foreground">Total Recipes</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {[...new Set(recipes.flatMap(recipe => recipe.cuisines))].length}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Cuisines</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {[...new Set(recipes.flatMap(recipe => recipe.dishTypes.filter((dishType) => dishTypes.includes(dishType))))].length}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Dish Types</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        {Math.max(...recipes.map(r => r.score))}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Highest Rated</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : null}
                            </div>
                        </main>
                    </div>
                </div>

                {/* Create Recipe Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Recipe</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Recipe Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Recipe Title *</label>
                                <Input
                                    placeholder="Enter recipe name"
                                    value={recipeFormData.title}
                                    onChange={(e) => setRecipeFormData({ ...recipeFormData, title: e.target.value })}
                                />
                            </div>

                            {/* Basic Details */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Servings</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={recipeFormData.servings}
                                        onChange={(e) => setRecipeFormData({ ...recipeFormData, servings: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cook Time (min)</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={recipeFormData.readyInMinutes}
                                        onChange={(e) => setRecipeFormData({ ...recipeFormData, readyInMinutes: parseInt(e.target.value) || 30 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Dish Type</label>
                                    <Select value={recipeFormData.dishType} onValueChange={(value) => setRecipeFormData({ ...recipeFormData, dishType: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select dish type" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" sideOffset={4}>
                                            {dishTypes.filter(dt => dt !== 'All').map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Cuisine */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuisine</label>
                                <Select value={recipeFormData.cuisine} onValueChange={(value) => setRecipeFormData({ ...recipeFormData, cuisine: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select cuisine" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={4}>
                                        {cuisines.filter(c => c !== 'All').map(cuisine => (
                                            <SelectItem key={cuisine} value={cuisine}>
                                                {cuisine}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Ingredients */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ingredients *</label>
                                <div className="relative">
                                    <Autosuggest
                                        data={[...ingredientData, ...recipeFormData.ingredients]}
                                        query={newIngredient}
                                        setQuery={setNewIngredient}
                                    />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        type="button"
                                        onClick={handleAddIngredient}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Ingredient
                                    </Button>
                                </div>
                                {recipeFormData.ingredients.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {recipeFormData.ingredients.map((ingredient, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {ingredient}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIngredient(index)}
                                                    className="ml-1 hover:opacity-70"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Instructions *</label>
                                <textarea
                                    placeholder="Enter cooking instructions"
                                    value={recipeFormData.instructions}
                                    onChange={(e) => setRecipeFormData({ ...recipeFormData, instructions: e.target.value })}
                                    className="w-full p-2 rounded-md border border-input bg-background text-foreground min-h-24"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateRecipe} disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Recipe'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SidebarProvider>
        </RequireAuth>
    );
};

export default Recipes;
