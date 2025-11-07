// app/grocery-list/page.tsx

'use client';

import { useState } from 'react';
import AppHeader from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ShoppingCart, CheckCircle2, Circle, Filter } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';

interface GroceryItem {
    id: string;
    name: string;
    category: string;
    completed: boolean;
    quantity?: string;
}

export default function GroceryListPage() {
    const [newItem, setNewItem] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [items, setItems] = useState<GroceryItem[]>([
        { id: '1', name: 'Apples', category: 'Produce', completed: false, quantity: '6' },
        { id: '2', name: 'Bananas', category: 'Produce', completed: true, quantity: '1 bunch'},
        { id: '3', name: 'Milk', category: 'Dairy', completed: false, quantity: '1 gallon' },
        { id: '4', name: 'Eggs', category: 'Dairy', completed: false, quantity: '1 dozen' },
        { id: '5', name: 'Chicken Breast', category: 'Meat', completed: false, quantity: '2 lbs' },
    ]);
    const [categories, setCategories] = useState(['Produce', 'Dairy', 'Meat', 'Pantry']);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const addItem = () => {
        if (!newItem.trim()) return;

        const defaultCategory = categories[0] || 'Uncategorized';
        const newGroceryItem: GroceryItem = {
            id: Date.now().toString(),
            name: newItem,
            category: defaultCategory,
            completed: false,
        };

        setItems([...items, newGroceryItem]);
        setNewItem('');
    };

    const addCategory = () => {
        if (!newCategory.trim() || categories.includes(newCategory)) return;

        setCategories([...categories, newCategory]);
        setNewCategory('');
    };

    const toggleItem = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? {...item, completed: !item.completed } : item
        ));
    };

    const deleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const deleteCategory = (category: string) => {
        // Move items from deleted category to first available category
        const newCategories = categories.filter(cat => cat !== category);
        const fallbackCategory = newCategories[0] || 'Uncategorized';

        setItems(items.map(item =>
            item.category === category ? { ...item, category: fallbackCategory } : item
        ));
        setCategories(newCategories);
    };

    const clearCompleted = () => {
        setItems(items.filter(item => !item.completed));
    };

    const filteredItems = items.filter(item => {
        if (filter === 'active') return !item.completed;
        if (filter === 'completed') return item.completed;
        return true;
    });

    const getItemsByCategory = (category: string) => {
        return filteredItems.filter(item => item.category === category);
    };

    const totalItems = items.length;
    const completedItems = items.filter(item => item.completed).length;
    const activeItems = totalItems - completedItems;

    const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') {
            action();
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <AppHeader title="Grocery List" />

                    <main className="flex-1 p-6 bg-muted/20">
                        <div className="max-w-6xl mx-auto space-y-6">
                            {/* Stats and Filters */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <ShoppingCart className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <p className="text-2xl font-bold">{totalItems}</p>
                                            <p className="text-sm text-muted-foreground">Total Items</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4 flex items-center gap-3">
                                        <Circle className="h-8 w-8 text-orange-500" />
                                        <div>
                                            <p className="text-2xl font-bold">{activeItems}</p>
                                            <p className="text-sm text-muted-foreground">To Buy</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        <div>
                                            <p className="text-2xl font-bold">{completedItems}</p>
                                            <p className="text-sm text-muted-foreground">Completed</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Filter className="h-4 w-4" />
                                                Filter
                                            </label>
                                            <select
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value as any)}
                                                className="w-full p-2 border rounded-md text-sm"
                                            >
                                                <option value="all">All Items</option>
                                                <option value="active">To Buy</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Add Item and Category */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2">
                                            <Plus className="h-5 w-5" />
                                            Add New Item
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="E.g. Apples"
                                                value={newItem}
                                                onChange={(e) => setNewItem(e.target.value)}
                                                onKeyPress={(e) => handleKeyPress(e, addItem)}
                                            />
                                            <Button onClick={addItem}>Add</Button>
                                        </div>
                                        {categories.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map(category => (
                                                    <Badge key={category} variant="secondary" className="text-xs">
                                                        {category}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle>Manage Categories</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="E.g. Produce"
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                onKeyPress={(e) => handleKeyPress(e, addCategory)}
                                            />
                                            <Button onClick={addCategory}>Add</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(category => (
                                                <Badge key={category} variant="outline" className="text-xs">
                                                    {category}
                                                    <button
                                                        onClick={() => deleteCategory(category)}
                                                        className="ml-1 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Grocery List by Category */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {categories.map(category => {
                                    const categoryItems = getItemsByCategory(category);
                                    if (categoryItems.length === 0) return null;

                                    return (
                                        <Card key={category} className="relative">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center jusitfy-between">
                                                    <span>{category}</span>
                                                    <Badge variant="secondary">
                                                        {categoryItems.length}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-3">
                                                    {categoryItems.map((item) => (
                                                        <li
                                                            key={item.id}
                                                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                                item.completed ? 'bg-muted/50' : 'hover:bg-muted/30'
                                                            }`}
                                                        >
                                                            <button
                                                                onClick={() => toggleItem(item.id)}
                                                                className={`flex-shrink-0 rounded-full border-2 p-1 ${
                                                                    item.completed ? 'border-green-50 bg-green-500 text-white' : 'border-gray-300 hover:border-green-500'
                                                                }`}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            </button>

                                                            <div className="flex-1 min-w-0">
                                                                <label
                                                                    className={`font-medium cursor-pointer block ${
                                                                        item.completed ? 'line-through text-muted-foreground' : ''
                                                                    }`}
                                                                >
                                                                    {item.name}
                                                                </label>
                                                                {item.quantity && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {item.quantity}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => deleteItem(item.id)}
                                                                className="flex-shrink-0 h-8 w-8 hover:bg-red-100 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>

                            {/* Action Buttons */}
                            {(completedItems > 0 || totalItems > 0) && (
                                <div className="flex justify-center gap-4">
                                    {completedItems > 0 && (
                                        <Button variant="outline" onClick={clearCompleted}>
                                            Clear Completed ({completedItems})
                                        </Button>
                                    )}
                                    {totalItems > 0 && (
                                        <Button>
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Export Shopping List
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Empty State */}
                            {totalItems === 0 && (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">You grocery list is empty</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Start by adding some items to your grocery list
                                        </p>
                                        <Button onClick={() => document.querySelector('input')?.focus()}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Your First Item
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}