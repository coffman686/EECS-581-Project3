'use client';

import { useState } from 'react';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Search, Filter, ShoppingBag, Calendar, PencilLine, Save, X } from 'lucide-react';
import ImageClassificationDialog from '@/components/image-classification-dialog';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface PantryItem {
    id: number;
    name: string;
    quantity: string;
    category: string;
    expiryDate?: string;
    addedDate: string;
}

const categories = [
    'Grains & Flour',
    'Sweeteners',
    'Dairy & Eggs',
    'Meat & Poultry',
    'Seafood',
    'Fruits',
    'Vegetables',
    'Herbs & Spices',
    'Oils & Vinegar',
    'Canned Goods',
    'Baking Supplies',
    'Beverages',
    'Snacks',
    'Frozen',
    'Other'
];

const Pantry = () => {
    const [items, setItems] = useState<PantryItem[]>([
        { id: 1, name: 'All-Purpose Flour', quantity: '2 lbs', category: 'Grains & Flour', addedDate: '2024-01-15' },
        { id: 2, name: 'Granulated Sugar', quantity: '1 lb', category: 'Sweeteners', addedDate: '2024-01-10' },
        { id: 3, name: 'Large Eggs', quantity: '12', category: 'Dairy & Eggs', expiryDate: '2024-02-01', addedDate: '2024-01-20' },
        { id: 4, name: 'Olive Oil', quantity: '500 ml', category: 'Oils & Vinegars', addedDate: '2024-01-05' },
        { id: 5, name: 'Canned Tomatoes', quantity: '2 cans', category: 'Canned Goods', expiryDate: '2025-01-01', addedDate: '2024-01-12' },
    ]);

    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [itemCategory, setItemCategory] = useState(categories[0]);
    const [expiryDate, setExpiryDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editQuantity, setEditQuantity] = useState('');
    const [editCategory, setEditCategory] = useState(categories[0]);
    const [editExpiry, setEditExpiry] = useState('');

    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    const beginEdit = (item: PantryItem) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditQuantity(item.quantity);
        setEditCategory(item.category);
        setEditExpiry(item.expiryDate ?? '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditQuantity('');
        setEditCategory(categories[0]);
        setEditExpiry('');
    };

    const saveEdit = (id: number) => {
        setItems(prev =>
        prev.map(it =>
            it.id === id
            ? {
                ...it,
                name: editName.trim() || it.name,
                quantity: editQuantity.trim() || it.quantity,
                category: editCategory || it.category,
                expiryDate: editExpiry.trim() ? editExpiry : undefined
                }
            : it
        )
        );
        cancelEdit();
    };

    const handleEditKey = (e: React.KeyboardEvent, id: number) => {
        if (e.key === 'Enter') saveEdit(id);
        if (e.key === 'Escape') cancelEdit();
    };

    const addItem = () => {
        if (itemName.trim() !== '' && itemQuantity.trim() !== '') {
            const newItem: PantryItem = {
                id: Date.now(),
                name: itemName.trim(),
                quantity: itemQuantity.trim(),
                category: itemCategory,
                expiryDate: expiryDate || undefined,
                addedDate: new Date().toISOString().split('T')[0],
            };
            setItems([...items, newItem]);
            setItemName('');
            setItemQuantity('');
            setExpiryDate('');
            setItemCategory(categories[0]);
        }
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const clearAll = () => {
        setItems([]);
        cancelEdit();
    };

    const getDaysUntilExpiry = (expiryDate: string): number => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getExpiryStatus = (expiryDate?: string) => {
        if (!expiryDate) return null;

        const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

        if (daysUntilExpiry < 0) return { label: 'Expired', variant: 'destructive' as const};
        if (daysUntilExpiry <= 3) return { label: 'Expiring Soon', variant: 'destructive' as const};
        if (daysUntilExpiry <= 7) return { label: 'This Week', variant: 'secondary' as const};
        return { label: 'Good', variant: 'default' as const};
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const itemsByCategory = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, PantryItem[]>);

    const totalItems = items.length;
    const expiringSoon = items.filter((item) => {
        if (!item.expiryDate) return false;
        const days = getDaysUntilExpiry(item.expiryDate);
        return days <= 7 && days >= 0;
    }).length;

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addItem();
        }
    };

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title="Pantry" />
                        <main className="relative flex-1 p-6 bg-muted/20">
                            <div className="max-w-6xl mx-auto space-y-6">
                                {/* Stats Overview */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card>
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <ShoppingBag className="h-8 w-8 text-blue-500" />
                                            <div>
                                                <p className="text-2xl font-bold">{totalItems}</p>
                                                <p className="text-sm text-muted-foreground">Total Items</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <Calendar className="h-8 w-8 text-orange-500" />
                                            <div>
                                                <p className="text-2xl font-bold">{expiringSoon}</p>
                                                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <Filter className="h-8 w-8 text-green-500" />
                                            <div>
                                                <p className="text-2xl font-bold">{categories.length}</p>
                                                <p className="text-sm text-muted-foreground">Categories</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Add Item Form */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Plus className="h-5 w-5" />
                                            Add New Item
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            <Input
                                                placeholder="Item Name"
                                                value={itemName}
                                                onChange={(e) => setItemName(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                            />
                                            <Input 
                                                placeholder="Quantity (e.g., 2 lbs, 500 ml)"
                                                value={itemQuantity}
                                                onChange={(e) => setItemQuantity(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                            />
                                            <Select
                                                value={itemCategory}
                                                onValueChange={(value) => setItemCategory(value)}
                                            >
                                                <SelectTrigger className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Input
                                                type="date"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                            />
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Button onClick={addItem} className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add to Pantry
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                                onClick={() => setImageDialogOpen(true)}
                                            >
                                                Add via image
                                            </Button>
                                            {totalItems > 0 && (
                                                <Button
                                                    variant="destructive"
                                                    onClick={clearAll}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Search and Filter */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            placeholder="Search pantry items..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select
                                        value={selectedCategory}
                                        onValueChange={(value) => setSelectedCategory(value)}
                                    >
                                        <SelectTrigger className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>

                                {/* Pantry Items by Category */}
                                <div className="space-y-6">
                                    {Object.keys(itemsByCategory).length > 0 ? (
                                        Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                                            <Card key={category}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between">
                                                        <span>{category}</span>
                                                        <Badge variant="secondary">
                                                            {categoryItems.length} items
                                                        </Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                        {categoryItems.map((item) => {
                                                            const expiryStatus = getExpiryStatus(item.expiryDate);
                                                            const isEditing = editingId === item.id;
                                                            return (
                                                                <div
                                                                    key={item.id}
                                                                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                                >
                                                                    {!isEditing ? (
                                                                        <>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <h4 className="font-medium text-sm truncate">
                                                                                        {item.name}
                                                                                    </h4>
                                                                                    {expiryStatus && (
                                                                                        <Badge
                                                                                            variant={expiryStatus.variant}
                                                                                            className="text-xs"
                                                                                        >
                                                                                            {expiryStatus.label}
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    {item.quantity}
                                                                                </p>
                                                                                {item.expiryDate && (
                                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                                        Expires:{' '}
                                                                                        {new Date(item.expiryDate).toLocaleDateString()}
                                                                                    </p>
                                                                                )}
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Added:{' '}
                                                                                    {new Date(item.addedDate).toLocaleDateString()}
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex gap-1">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => beginEdit(item)}
                                                                                    className="h-8 w-8"
                                                                                    title="Edit"
                                                                                >
                                                                                    <PencilLine className="h-4 w-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => removeItem(item.id)}
                                                                                    className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                                                                                    title="Delete"
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex-1 min-w-0 space-y-2">
                                                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                                                                <Input
                                                                                    autoFocus
                                                                                    placeholder="Name"
                                                                                    value={editName}
                                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                                    onKeyDown={(e) => handleEditKey(e, item.id)}
                                                                                />
                                                                                <Input
                                                                                    placeholder="Quantity"
                                                                                    value={editQuantity}
                                                                                    onChange={(e) => setEditQuantity(e.target.value)}
                                                                                    onKeyDown={(e) => handleEditKey(e, item.id)}
                                                                                />
                                                                                <Select
                                                                                    value={editCategory}
                                                                                    onValueChange={(value) => setEditCategory(value)}
                                                                                >
                                                                                    <SelectTrigger
                                                                                        className="w-full border rounded-md text-sm bg-background px-3 py-2"
                                                                                        onKeyDown={(e) => handleEditKey(e, item.id)}
                                                                                    >
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {[...new Set([item.category, ...categories])].map((cat) => (
                                                                                            <SelectItem key={cat} value={cat}>
                                                                                                {cat}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>

                                                                                <Input
                                                                                    type="date"
                                                                                    value={editExpiry}
                                                                                    onChange={(e) => setEditExpiry(e.target.value)}
                                                                                    onKeyDown={(e) => handleEditKey(e, item.id)}
                                                                                />
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <Button size="sm" onClick={() => saveEdit(item.id)}>
                                                                                    <Save className="h-4 w-4 mr-1" />
                                                                                    Save
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={cancelEdit}
                                                                                >
                                                                                    <X className="h-4 w-4 mr-1" />
                                                                                    Cancel
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card className="text-center py-12">
                                            <CardContent>
                                                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">
                                                    {searchTerm || selectedCategory !== 'All'
                                                        ? 'No items found'
                                                        : 'Your pantry is empty'
                                                    }
                                                </h3>
                                                <p className="text-muted-foreground mb-4">
                                                    {searchTerm || selectedCategory !== 'All'
                                                        ? 'Try adjusting your search or filter criteria'
                                                        : 'Start by adding some ingredients to your pantry'
                                                    }
                                                </p>
                                                {!searchTerm && selectedCategory === 'All' && (
                                                    <Button
                                                        onClick={() => document.querySelector('input')?.focus()}
                                                        className="flex items-center gap-2 mx-auto"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add Your First Item
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                            <ImageClassificationDialog
                                open={imageDialogOpen}
                                onOpenChange={setImageDialogOpen}
                                onResult={(label) => setItemName(label)}
                            />
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    );
};

export default Pantry;