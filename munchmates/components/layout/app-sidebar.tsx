// Application Sidebar Component
// Provides the collapsible left-hand navigation used across authenticated pages.
// Includes:
// - App logo + collapse toggle
// - Primary navigation links (Dashboard, Recipes, Planner, Pantry, etc.)
// - Footer section with Settings link
// Behavior:
// - Collapsible via icon toggle (shrinks to icon-only mode)
// - Highlights active route using Next.js pathname
// - Uses shared UI primitives (Sidebar, Avatar, Buttons)
// Central piece of the app layout used in all main views.

"use client";

import Link from "next/link";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../ui/avatar";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "../ui/sidebar";
import {
    BookOpen,
    ChefHat,
    LayoutDashboard,
    CalendarDays,
    ShoppingCart,
    Warehouse,
    Users,
    Settings,
    PanelLeft,
    FolderHeart,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

// data for sidebar elements
const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { href: "/recipes", icon: <BookOpen />, label: "Recipes" },
    { href: "/shared-collections", icon: <FolderHeart />, label: "Shared Collections" },
    { href: "/meal-planner", icon: <CalendarDays />, label: "Meal Planner" },
    { href: "/grocery-list", icon: <ShoppingCart />, label: "Grocery List" },
    { href: "/pantry", icon: <Warehouse />, label: "Pantry" },
    { href: "/community", icon: <Users />, label: "Community" },
];

const AppSidebar = () => {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const sidebarWidth = isCollapsed ? "w-16" : "w-64";
    const textVisibility = isCollapsed ? "sr-only" : "block";
    const logoVisibility = isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100";

    return (
        <Sidebar collapsible="icon" className={`border-r bg-background transition-all duration-300 ${sidebarWidth}`}>
            <SidebarHeader className="flex items-center justify-between p-4 border-b">
                <Link href="/dashboard" className={`flex items-center gap-2.5 transition-opacity ${logoVisibility}`}>
                    <ChefHat className="size-7 text-primary" />
                    <h2 className="text-lg font-bold tracking-tight text-sidebar-foreground">
                        MunchMates
                    </h2>
                </Link>
                 <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-6 w-6 p-0">
                    <PanelLeft className="h-4 w-4" />
                </Button>
            </SidebarHeader>

            <SidebarContent className="flex-1 p-4">
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith(item.href)}
                                tooltip={{ children: item.label, side: "right" }}
                            >
                                <Link href={item.href}>
                                    <span className="flex items-center gap-3">
                                        {item.icon}
                                        <span className={textVisibility}>{item.label}</span>
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: "Settings", side: "right" }}>
                            <Link href="/profile">
                                <span className="flex items-center gap-3">
                                    <Settings />
                                    <span className={textVisibility}>Settings</span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
