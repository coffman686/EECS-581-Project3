// File: page.tsx
// Purpose: Show details for a single shared recipe collection
// Inputs: Dynamic route param id (collectionId)
// Outputs: Collection header, recipes list, members list
// Uses: authedFetch for collection/members CRUD, role-based edit controls

'use client';

import { useState, useEffect, use } from 'react';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { authedFetch } from '@/lib/authedFetch';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    FolderHeart, 
    ArrowLeft,
    Users, 
    ChefHat, 
    BookOpen,
    Trash2,
    UserPlus,
    Crown,
    Eye,
    Edit,
    MoreHorizontal,
    Clock
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

type PageProps = {
    params: Promise<{ id: string }>;
};

const SharedCollectionDetailPage = ({ params }: PageProps) => {
    const { id: collectionId } = use(params);
    const router = useRouter();
    const [collection, setCollection] = useState<SharedCollection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'editor' | 'viewer'>('viewer');
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string>('viewer');

    // Load collection on mount
    useEffect(() => {
        loadCollection();
    }, [collectionId]);

    const loadCollection = async () => {
        setIsLoading(true);
        try {
            const response = await authedFetch(`/api/shared-collections/${collectionId}`);
            if (response.ok) {
                const data = await response.json();
                setCollection(data.collection);
                // Determine current user's role (first member is typically current user for demo)
                const userRole = data.collection.members[0]?.role || 'viewer';
                setCurrentUserRole(userRole);
            } else {
                router.push('/shared-collections');
            }
        } catch (error) {
            console.error('Error loading collection:', error);
            router.push('/shared-collections');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberName.trim()) return;

        setIsAddingMember(true);
        try {
            // In a real app, you would search for the user by name/email
            // For this demo, we'll use the name as both ID and name
            const response = await authedFetch(`/api/shared-collections/${collectionId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: `user_${Date.now()}`,
                    memberName: newMemberName.trim(),
                    role: newMemberRole,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCollection(data.collection);
                setNewMemberName('');
                setNewMemberRole('viewer');
                setIsAddMemberDialogOpen(false);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add member');
            }
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add member. Please try again.');
        } finally {
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            const response = await authedFetch(
                `/api/shared-collections/${collectionId}/members?memberId=${memberId}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                const data = await response.json();
                setCollection(data.collection);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    const handleRemoveRecipe = async (recipeId: number) => {
        if (!confirm('Are you sure you want to remove this recipe from the collection?')) return;

        try {
            const response = await authedFetch(`/api/shared-collections/${collectionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'removeRecipe',
                    recipeId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCollection(data.collection);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to remove recipe');
            }
        } catch (error) {
            console.error('Error removing recipe:', error);
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
                return <Crown className="h-4 w-4 text-yellow-500" />;
            case 'editor':
                return <Edit className="h-4 w-4 text-blue-500" />;
            default:
                return <Eye className="h-4 w-4 text-gray-500" />;
        }
    };

    const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
        switch (role) {
            case 'owner':
                return 'default';
            case 'editor':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const canEdit = currentUserRole === 'owner' || currentUserRole === 'editor';

    if (isLoading) {
        return (
            <RequireAuth>
                <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                        <AppSidebar />
                        <div className="flex-1 flex flex-col">
                            <AppHeader title="Shared Collection" />
                            <main className="flex-1 p-6 flex items-center justify-center">
                                <ChefHat className="h-12 w-12 text-muted-foreground animate-spin" />
                            </main>
                        </div>
                    </div>
                </SidebarProvider>
            </RequireAuth>
        );
    }

    if (!collection) {
        return null;
    }

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title={collection.name} />
                        <main className="flex-1 p-6">
                            <div className="max-w-6xl mx-auto">
                                {/* Header */}
                                <div className="mb-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/shared-collections')}
                                        className="mb-4"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Collections
                                    </Button>
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div>
                                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                                <FolderHeart className="h-8 w-8 text-primary" />
                                                {collection.name}
                                            </h1>
                                            {collection.description && (
                                                <p className="text-muted-foreground mt-2">
                                                    {collection.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Crown className="h-4 w-4" />
                                                    Created by {collection.createdByName}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDate(collection.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getRoleBadgeVariant(currentUserRole)} className="flex items-center gap-1">
                                                {getRoleIcon(currentUserRole)}
                                                {currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Recipes Section */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="flex items-center gap-2">
                                                        <BookOpen className="h-5 w-5" />
                                                        Recipes ({collection.recipes.length})
                                                    </CardTitle>
                                                    <Link href="/recipes">
                                                        <Button variant="outline" size="sm">
                                                            Browse Recipes
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {collection.recipes.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <h3 className="font-semibold mb-2">No recipes yet</h3>
                                                        <p className="text-sm text-muted-foreground mb-4">
                                                            Add recipes from your saved recipes or browse new ones
                                                        </p>
                                                        <Link href="/recipes/saved">
                                                            <Button variant="outline">
                                                                Go to Saved Recipes
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {collection.recipes.map((recipe) => (
                                                            <div
                                                                key={recipe.recipeId}
                                                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                            >
                                                                <div className="flex-1">
                                                                    <Link
                                                                        href={`/recipes/${recipe.recipeId}`}
                                                                        className="font-medium hover:underline"
                                                                    >
                                                                        {recipe.recipeName}
                                                                    </Link>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Added by {recipe.addedByName} on {formatDate(recipe.addedAt)}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => router.push(`/recipes/${recipe.recipeId}`)}
                                                                    >
                                                                        View
                                                                    </Button>
                                                                    {canEdit && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleRemoveRecipe(recipe.recipeId)}
                                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Members Section */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Users className="h-5 w-5" />
                                                        Members ({collection.members.length})
                                                    </CardTitle>
                                                    {canEdit && (
                                                        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <UserPlus className="h-4 w-4 mr-1" />
                                                                    Add
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Add Member</DialogTitle>
                                                                    <DialogDescription>
                                                                        Invite someone to join this collection.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-4 py-4">
                                                                    <div className="space-y-2">
                                                                        <label htmlFor="memberName" className="text-sm font-medium">
                                                                            Member Name
                                                                        </label>
                                                                        <Input
                                                                            id="memberName"
                                                                            placeholder="Enter member name"
                                                                            value={newMemberName}
                                                                            onChange={(e) => setNewMemberName(e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label htmlFor="memberRole" className="text-sm font-medium">
                                                                            Role
                                                                        </label>
                                                                        <Select
                                                                            value={newMemberRole}
                                                                            onValueChange={(value: 'editor' | 'viewer') => setNewMemberRole(value)}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select role" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="viewer">
                                                                                    <span className="flex items-center gap-2">
                                                                                        <Eye className="h-4 w-4" />
                                                                                        Viewer - Can view recipes
                                                                                    </span>
                                                                                </SelectItem>
                                                                                <SelectItem value="editor">
                                                                                    <span className="flex items-center gap-2">
                                                                                        <Edit className="h-4 w-4" />
                                                                                        Editor - Can add/remove recipes
                                                                                    </span>
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => setIsAddMemberDialogOpen(false)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        onClick={handleAddMember}
                                                                        disabled={!newMemberName.trim() || isAddingMember}
                                                                    >
                                                                        {isAddingMember ? 'Adding...' : 'Add Member'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {collection.members.map((member) => (
                                                        <div
                                                            key={member.userId}
                                                            className="flex items-center justify-between p-3 rounded-lg border"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback className="text-xs">
                                                                        {getInitials(member.userName)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-sm">{member.userName}</p>
                                                                    <Badge
                                                                        variant={getRoleBadgeVariant(member.role)}
                                                                        className="text-xs flex items-center gap-1 w-fit"
                                                                    >
                                                                        {getRoleIcon(member.role)}
                                                                        {member.role}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            {currentUserRole === 'owner' && member.role !== 'owner' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveMember(member.userId)}
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    );
};

export default SharedCollectionDetailPage;
