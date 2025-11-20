'use client';

import { useState, useEffect } from 'react';
import DynamicList from '@/components/ingredients/DynamicList';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Clock, Users, ChefHat, Filter, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
const Recipes = () => {
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDishType, setSelectedDishType] = useState('All');
    const [selectedCuisine, setSelectedCuisine] = useState('All');

    const dishTypes = ['All', 'main course', 'side dish', 'dessert', 'appetizer', 'salad', 'bread', 'breakfast', 'soup', 'beverage', 'sauce', 'marinade', 'fingerfood', 'snack', 'drink'];
    const cuisines = ['All', 'African', 'Asian', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese', 'Eastern European', 'European', 'French', 'German', 'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American', 'Mediterranean', 'Mexican', 'Middle Eastern', 'Nordic', 'Southern', 'Spanish', 'Thai', 'Vietnamese'];
    
    const fetchRecipes = async () => {
        const response = await fetch(`/api/spoonacular/recipes/searchByIngredient?ingredients=${searchTerm}&cuisine=${selectedCuisine !== 'All' ? selectedCuisine : undefined}&dishType=${selectedDishType !== 'All' ? selectedDishType : undefined}`);
        const data = await response.json();
        setRecipes(data.results);
    }

    useEffect(() => {
        fetchRecipes()
    }, [searchTerm, selectedCuisine, selectedDishType])

    const handleSearch = async () => {
        const ingredientListString = ingredientList.join(',').toLowerCase();  
        setSearchTerm(ingredientListString);
    };

    const createNewRecipe = () => {
        // Logic to create a new recipe would go here
        console.log('Create new recipe');
    };

    const [ingredientList, setIngredientList] = useState<string[]>([]);
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
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <DynamicList ingredients={ingredientList} setIngredients={setIngredientList}/>
                                    <Button onClick={handleSearch} className="flex items-center gap-2">
                                        <Search className="h-4 w-4" />
                                        Search Recipes
                                    </Button>
                                    <Button onClick={createNewRecipe} className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create New Recipe
                                    </Button>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Filter by:</span>
                                    </div>
                                    <select
                                        value={selectedDishType}
                                        onChange={(e) => setSelectedDishType(e.target.value)}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        {dishTypes.map(dishType => (
                                            <option key={dishType} value={dishType}>
                                                {dishType.charAt(0).toUpperCase() + dishType.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedCuisine}
                                        onChange={(e) => setSelectedCuisine(e.target.value)}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        {cuisines.map(cuisine => (
                                            <option key={cuisine} value={cuisine}>
                                                {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                                            </option>
                                        ))}
                                    </select>
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
                                                        className="w-full"
                                                    >
                                                        View Recipe
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="text-center py-12">
                                        <CardContent>
                                            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">
                                                {searchTerm || selectedDishType !== 'All' || selectedCuisine !== 'All'
                                                    ? 'No recipes found'
                                                    : 'No recipes yet'
                                                }
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                {searchTerm || selectedDishType !== 'All' || selectedCuisine !== 'All'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Start by creating your first recipe'
                                                }
                                            </p>
                                            {(!searchTerm && selectedDishType === 'All' && selectedCuisine === 'All') && (
                                                <Button 
                                                    onClick={createNewRecipe}
                                                    className="flex items-center gap-2 mx-auto"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Create Your First Recipe
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                                {/* Stats */}
                                { recipes && recipes.length > 0 ? (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                            <div>
                                                <p className="text-2xl font-bold text-primary">{recipes.length}</p>
                                                <p className="text-sm text-muted-foreground">Total Recipes</p>
                                            </div>
                                            <div>  
                                                <p className="text-2xl font-bold text-green-600">
                                                    {[ ...new Set(recipes.flatMap(recipe => recipe.cuisines))].length}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Cuisines</p>  
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {[ ...new Set(recipes.flatMap(recipe => recipe.dishTypes.filter((dishType) => dishTypes.includes(dishType))))].length}
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
            </SidebarProvider>
        </RequireAuth>
    );
};

export default Recipes;