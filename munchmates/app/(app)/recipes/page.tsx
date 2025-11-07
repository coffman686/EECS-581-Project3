'use client';

import { useState } from 'react';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Clock, Users, ChefHat, Filter, Star } from 'lucide-react';

interface Recipe {
    id: number;
    name: string;
    description: string;
    cookTime: number;
    servings: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    rating: number;
    image?: string;
}

const Recipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([
        { 
            id: 1, 
            name: 'Spaghetti Carbonara', 
            description: 'A classic Italian pasta dish with eggs, cheese, pancetta, and pepper.', 
            cookTime: 30,
            servings: 4,
            difficulty: 'Medium',
            category: 'Pasta',
            rating: 4.8
        },
        { 
            id: 2, 
            name: 'Chicken Tikka Masala', 
            description: 'Creamy and flavorful Indian curry with tender chicken pieces.', 
            cookTime: 45,
            servings: 6,
            difficulty: 'Medium',
            category: 'Curry',
            rating: 4.6
        },
        { 
            id: 3, 
            name: 'Chocolate Chip Cookies', 
            description: 'Classic soft and chewy cookies loaded with chocolate chips.', 
            cookTime: 25,
            servings: 24,
            difficulty: 'Easy',
            category: 'Dessert',
            rating: 4.9
        },
        { 
            id: 4, 
            name: 'Caesar Salad', 
            description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan.', 
            cookTime: 15,
            servings: 2,
            difficulty: 'Easy',
            category: 'Salad',
            rating: 4.3
        },
        { 
            id: 5, 
            name: 'Beef Bourguignon', 
            description: 'French beef stew braised in red wine with mushrooms and onions.', 
            cookTime: 180,
            servings: 6,
            difficulty: 'Hard',
            category: 'Stew',
            rating: 4.7
        },
        { 
            id: 6, 
            name: 'Vegetable Stir Fry', 
            description: 'Quick and healthy stir-fried vegetables with tofu in a savory sauce.', 
            cookTime: 20,
            servings: 4,
            difficulty: 'Easy',
            category: 'Vegetarian',
            rating: 4.4
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');

    const categories = ['All', 'Pasta', 'Curry', 'Dessert', 'Salad', 'Stew', 'Vegetarian', 'Breakfast', 'Seafood'];
    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'All' || recipe.difficulty === selectedDifficulty;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Search logic is handled by the filteredRecipes
    };

    const createNewRecipe = () => {
        // Logic to create a new recipe would go here
        console.log('Create new recipe');
    };

    const viewRecipe = (recipeId: number) => {
        // Logic to view recipe details would go here
        console.log('View recipe:', recipeId);
    };

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title="Recipes" />
                        <main className="flex-1 p-6 bg-muted/20">
                            <div className="max-w-7xl mx-auto space-y-6">
                                {/* Header with Search and Create */}
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <div className="flex-1 max-w-2xl">
                                        <form onSubmit={handleSearch} className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                type="text"
                                                placeholder="Search recipes by name or ingredients..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 w-full"
                                            />
                                        </form>
                                    </div>
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
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        {difficulties.map(difficulty => (
                                            <option key={difficulty} value={difficulty}>
                                                {difficulty}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Recipe Grid */}
                                {filteredRecipes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredRecipes.map(recipe => (
                                            <Card key={recipe.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                                <div className="h-48 bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                                                    <ChefHat className="h-16 w-16 text-primary/50" />
                                                </div>
                                                <CardHeader className="pb-3 flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <CardTitle className="text-lg leading-tight">
                                                            {recipe.name}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span>{recipe.rating}</span>
                                                        </div>
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {recipe.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pb-3">
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <Badge variant="secondary" className={getDifficultyColor(recipe.difficulty)}>
                                                            {recipe.difficulty}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {recipe.category}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{recipe.cookTime} min</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{recipe.servings} servings</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button 
                                                        onClick={() => viewRecipe(recipe.id)}
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
                                                {searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All'
                                                    ? 'No recipes found'
                                                    : 'No recipes yet'
                                                }
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                {searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Start by creating your first recipe'
                                                }
                                            </p>
                                            {(!searchTerm && selectedCategory === 'All' && selectedDifficulty === 'All') && (
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
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                            <div>
                                                <p className="text-2xl font-bold text-primary">{recipes.length}</p>
                                                <p className="text-sm text-muted-foreground">Total Recipes</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {recipes.filter(r => r.difficulty === 'Easy').length}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Easy Recipes</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {categories.length - 1}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Categories</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {Math.max(...recipes.map(r => r.rating))}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Highest Rated</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    );
};

export default Recipes;