"use client";

import Link from "next/link";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
    BookOpen,
    ChefHat,
    LayoutDashboard,
    CalendarDays,
    ShoppingCart,
    Warehouse,
    Users,
    Settings,
    Sidebar,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { href: "/recipes", icon: <BookOpen />, label: "Recipes" },
    { href: "/meal-planner", icon: <CalendarDays />, label: "Meal Planner" },
    { href: "/grocery-list", icon: <ShoppingCart />, label: "Grocery List" },
    { href: "/pantry", icon: <Warehouse />, label: "Pantry" },
    { href: "/community", icon: <Users />, label: "Community" },
];

const AppSidebar = () => {
    const pathname = usePathname();

    return (
        <>
            <SidebarHeader>
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <ChefHat className="size-7 text-primary" />
                    <h2 className="text-lg font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                        MunchMates
                    </h2>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith(item.href)}
                                tooltip={{ children: item.label, side: "right" }}
                            >
                                <Link href={item.href}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: "Settings", side: "right" }}>
                            <Link href="#">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: "User Profile", side: "right" }}>
                            <Link href="#">
                                <Avatar className="size-6">
                                    <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" />
                                    <AvatarFallback>MM</AvatarFallback>
                                </Avatar>
                                <span>Munch Mate</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </>
    );
};

export default AppSidebar;