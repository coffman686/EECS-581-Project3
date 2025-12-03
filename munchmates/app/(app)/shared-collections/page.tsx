// File: page.tsx
// Purpose: List and manage shared recipe collections
// Inputs: None (uses authedFetch to load current user's collections)
// Outputs: Grid of collections with create/delete actions and member/recipe counts
// Uses: Dialog for new collection, role hints, navigation to collection detail

'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { authedFetch } from '@/lib/authedFetch';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { 
    FolderHeart, 
    Plus, 
    Users, 
    ChefHat, 
    BookOpen,
    Trash2,
    Settings,
    UserPlus,
    Crown,
    Eye,
    Edit
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CollectionMember = {
    userId: string;
    userName: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: string;
};

type SharedRecipe = {
    recipeId: number;
    recipeName: string;
    addedBy: string;
    addedByName: string;
    addedAt: string;
};

type SharedCollection = {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    members: CollectionMember[];
    recipes: SharedRecipe[];
};

const SharedCollectionsPage = () => {
    const router = useRouter();
    const [collections, setCollections] = useState<SharedCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionDescription, setNewCollectionDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Load collections on mount
    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        setIsLoading(true);
        try {
            const response = await authedFetch('/api/shared-collections');
            if (response.ok) {
                const data = await response.json();
                setCollections(data.collections || []);
            }
        } catch (error) {
            console.error('Error loading collections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;

        setIsCreating(true);
        try {
            const response = await authedFetch('/api/shared-collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCollectionName.trim(),
                    description: newCollectionDescription.trim(),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCollections(prev => [...prev, data.collection]);
                setNewCollectionName('');
                setNewCollectionDescription('');
                setIsCreateDialogOpen(false);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create collection');
            }
        } catch (error) {
            console.error('Error creating collection:', error);
            alert('Failed to create collection. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteCollection = async (collectionId: string) => {
        if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await authedFetch(`/api/shared-collections/${collectionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCollections(prev => prev.filter(c => c.id !== collectionId));
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete collection');
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
            alert('Failed to delete collection. Please try again.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner':
                return <Crown className="h-3 w-3 text-yellow-500" />;
            case 'editor':
                return <Edit className="h-3 w-3 text-blue-500" />;
            default:
                return <Eye className="h-3 w-3 text-gray-500" />;
        }
    };

    const getUserRole = (collection: SharedCollection): string => {
        // This would need to be compared with current user ID
        // For now, we'll check if user is the creator
        return collection.members[0]?.role || 'viewer';
    };

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title="Shared Collections" />
                        <main className="flex-1 p-6">
                            <div className="max-w-6xl mx-auto">
                                {/* Header */}
                                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold flex items-center gap-3">
                                            <FolderHeart className="h-8 w-8 text-primary" />
                                            Shared Collections
                                        </h1>
                                        <p className="text-muted-foreground mt-2">
                                            Create and manage recipe collections with friends and family
                                        </p>
                                    </div>
                                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                New Collection
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New Collection</DialogTitle>
                                                <DialogDescription>
                                                    Create a shared collection to organize recipes with others.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="name" className="text-sm font-medium">
                                                        Collection Name *
                                                    </label>
                                                    <Input
                                                        id="name"
                                                        placeholder="e.g., Family Favorites, Holiday Recipes"
                                                        value={newCollectionName}
                                                        onChange={(e) => setNewCollectionName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="description" className="text-sm font-medium">
                                                        Description
                                                    </label>
                                                    <Input
                                                        id="description"
                                                        placeholder="What is this collection about?"
                                                        value={newCollectionDescription}
                                                        onChange={(e) => setNewCollectionDescription(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsCreateDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleCreateCollection}
                                                    disabled={!newCollectionName.trim() || isCreating}
                                                >
                                                    {isCreating ? 'Creating...' : 'Create Collection'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Content */}
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <ChefHat className="h-12 w-12 text-muted-foreground animate-spin" />
                                    </div>
                                ) : collections.length === 0 ? (
                                    <Card className="text-center py-12">
                                        <CardContent>
                                            <FolderHeart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold mb-2">No shared collections yet</h3>
                                            <p className="text-muted-foreground mb-6">
                                                Create your first collection to start sharing recipes with others!
                                            </p>
                                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Your First Collection
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {collections.map((collection) => (
                                            <Card key={collection.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <CardTitle className="line-clamp-1 flex items-center gap-2">
                                                                <FolderHeart className="h-5 w-5 text-primary" />
                                                                {collection.name}
                                                            </CardTitle>
                                                            {collection.description && (
                                                                <CardDescription className="mt-1 line-clamp-2">
                                                                    {collection.description}
                                                                </CardDescription>
                                                            )}
                                                        </div>
                                                        {getUserRole(collection) === 'owner' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteCollection(collection.id)}
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 -mt-2 -mr-2"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="flex-1">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <BookOpen className="h-4 w-4" />
                                                            <span>{collection.recipes.length} recipes</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Users className="h-4 w-4" />
                                                            <span>{collection.members.length} members</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {collection.members.slice(0, 3).map((member) => (
                                                                <Badge
                                                                    key={member.userId}
                                                                    variant="secondary"
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    {getRoleIcon(member.role)}
                                                                    <span className="truncate max-w-[80px]">
                                                                        {member.userName}
                                                                    </span>
                                                                </Badge>
                                                            ))}
                                                            {collection.members.length > 3 && (
                                                                <Badge variant="outline">
                                                                    +{collection.members.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="border-t pt-4">
                                                    <div className="w-full flex gap-2">
                                                        <Button
                                                            variant="default"
                                                            className="flex-1"
                                                            onClick={() => router.push(`/shared-collections/${collection.id}`)}
                                                        >
                                                            View Collection
                                                        </Button>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    );
};

export default SharedCollectionsPage;
