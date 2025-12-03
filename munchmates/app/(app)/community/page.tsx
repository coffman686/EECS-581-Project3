// Community Page
// Renders the social feed section of MunchMates, showcasing example posts
// and exploring the future direction of in-app community features.
// Includes:
// - Search bar with text + tag matching
// - Filters for all posts vs. trending posts
// - Interactive post cards (likes, comments, shares, bookmarks)
// - Sidebar with community stats, trending posts, and popular tags
// Behavior:
// - Uses local in-memory mock posts to demonstrate UX flow
// - Supports liking and bookmarking with optimistic UI updates
// - Placeholder for future authenticated posting + live community backend
// This page serves as a proof-of-concept for the future social experience.

'use client';

import { useState } from 'react';
import AppHeader from '@/components/layout/app-header';
import RequireAuth from '@/components/RequireAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    MessageCircle,
    Heart,
    Share,
    Bookmark,
    Users,
    TrendingUp,
    Search,
    MoreHorizontal,
    Clock
} from 'lucide-react';

interface Post {
    id: number;
    author: string;
    avatar: string;
    text: string;
    likes: number;
    comments: number;
    shares: number;
    timestamp: string;
    isLiked: boolean;
    isBookmarked: boolean;
    tags: string[];
}

// Construct temporary data for user posts
const Community = () => {
    const [posts, setPosts] = useState<Post[]>([
        {
            id: 1,
            author: 'Jane Doe',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            text: 'Just tried the Spaghetti Carbonara recipe from the app, and it was amazing! The instructions were so clear and the result was restaurant-quality. Highly recommend! 🍝',
            likes: 24,
            comments: 8,
            shares: 3,
            timestamp: '2 hours ago',
            isLiked: false,
            isBookmarked: false,
            tags: ['pasta', 'italian', 'dinner']
        },
        {
            id: 2,
            author: 'John Smith',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
            text: 'Does anyone have a good recipe for a vegan shepherd\'s pie? I\'m looking for something hearty and flavorful that will satisfy my meat-loving family. Any tips for the perfect mashed potato topping?',
            likes: 12,
            comments: 15,
            shares: 2,
            timestamp: '5 hours ago',
            isLiked: true,
            isBookmarked: true,
            tags: ['vegan', 'comfort-food', 'help-needed']
        },
        {
            id: 3,
            author: 'Maria Garcia',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
            text: 'Just meal prepped for the entire week using the grocery list feature! Saved so much time and money. The automatic categorization made shopping a breeze. What are your favorite meal prep recipes?',
            likes: 42,
            comments: 23,
            shares: 7,
            timestamp: '1 day ago',
            isLiked: false,
            isBookmarked: true,
            tags: ['meal-prep', 'tips', 'organization']
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'trending'>('all');

    const popularTags = [
        'recipes', 'tips', 'vegan', 'meal-prep', 'baking',
        'quick-meals', 'healthy', 'comfort-food', 'international'
    ];

    // Sort posts by like count
    const trendingPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);

    // Filter posts with a search term for text, author, or tags
    const baseFilteredPosts = posts.filter(post =>
        post.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filter and sort posts by like count if trending filter selected
    const filteredPosts =
        activeFilter === 'trending'
            ? baseFilteredPosts
                .slice()
                .sort((a, b) => b.likes - a.likes)
            : baseFilteredPosts;

    // Handlse liking and disliking a post
    const handleLike = (postId: number) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? {
                    ...post,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    isLiked: !post.isLiked
                }
                : post
        ));
    };

    // Handles adding a post to bookmarks
    const handleBookmark = (postId: number) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, isBookmarked: !post.isBookmarked }
                : post
        ));
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title="Community" />
                        <main className="flex-1 p-6 bg-muted/20">
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Main Content */}
                                    <div className="lg:col-span-3 space-y-6">
                                        {/* Search and Filters */}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                <Input
                                                    placeholder="Search posts, users, or tags..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                                                    onClick={() => setActiveFilter('all')}
                                                >
                                                    All Posts
                                                </Button>
                                                <Button
                                                    variant={activeFilter === 'trending' ? 'default' : 'outline'}
                                                    onClick={() => setActiveFilter('trending')}
                                                >
                                                    Trending
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Posts */}
                                        <div className="space-y-4">
                                            {filteredPosts.map(post => (
                                                <Card key={post.id} className="overflow-hidden">
                                                    <CardHeader className="pb-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarImage src={post.avatar} />
                                                                    <AvatarFallback>
                                                                        {getInitials(post.author)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <h3 className="font-semibold text-sm">
                                                                        {post.author}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <Clock className="h-3 w-3" />
                                                                        {post.timestamp}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="pb-4">
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                            {post.text}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {post.tags.map(tag => (
                                                                <Badge
                                                                    key={tag}
                                                                    variant="secondary"
                                                                    className="cursor-pointer hover:bg-secondary/80"
                                                                >
                                                                    #{tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="bg-muted/50 px-6 py-3">
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex items-center gap-6">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleLike(post.id)}
                                                                    className={`flex items-center gap-2 ${
                                                                        post.isLiked ? 'text-red-500' : ''
                                                                    }`}
                                                                >
                                                                    <Heart
                                                                        className={`h-4 w-4 ${
                                                                            post.isLiked ? 'fill-current' : ''
                                                                        }`}
                                                                    />
                                                                    {post.likes}
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                                                    <MessageCircle className="h-4 w-4" />
                                                                    {post.comments}
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                                                    <Share className="h-4 w-4" />
                                                                    {post.shares}
                                                                </Button>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleBookmark(post.id)}
                                                                className={post.isBookmarked ? 'text-blue-500' : ''}
                                                            >
                                                                <Bookmark
                                                                    className={`h-4 w-4 ${
                                                                        post.isBookmarked ? 'fill-current' : ''
                                                                    }`}
                                                                />
                                                            </Button>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Empty State */}
                                        {filteredPosts.length === 0 && (
                                            <Card className="text-center py-12">
                                                <CardContent>
                                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        {searchTerm
                                                            ? 'Try adjusting your search terms.'
                                                            : 'This page currently showcases example community posts. Posting will be added in a future release.'
                                                        }
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Sidebar */}
                                    <div className="space-y-6">
                                        {/* Community Stats */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    Community Stats
                                                </h3>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Total Posts</span>
                                                    <span className="font-medium">{posts.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Active Today</span>
                                                    <span className="font-medium">42</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Total Members</span>
                                                    <span className="font-medium">1,247</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Trending Posts */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Trending Posts
                                                </h3>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {trendingPosts.map(post => (
                                                    <div key={post.id} className="text-sm">
                                                        <p className="font-medium line-clamp-2 mb-1">
                                                            {post.text.slice(0, 60)}...
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                            <span>{post.author}</span>
                                                            <span>{post.likes} likes</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>

                                        {/* Popular Tags */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <h3 className="font-semibold">Popular Tags</h3>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {popularTags.map(tag => (
                                                        <Badge
                                                            key={tag}
                                                            variant="outline"
                                                            className="cursor-pointer hover:bg-secondary"
                                                        >
                                                            #{tag}
                                                        </Badge>
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

export default Community;
