// app/page.tsx

import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    CalendarDays,
    ChefHat,
    Heart,
    LayoutGrid,
    ShoppingCart,
    Users,
    Warehouse,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

const heroImage = PlaceHolderImages.find((img) => img.id === "hero");

const features = [
    {
        icon: <LayoutGrid className="size-8 text-primary" />,
        title: "Recipe Collections",
        description: "Browse curated recipes for any occasion, diet, or craving.",
        image: PlaceHolderImages.find((img) => img.id === "recipes"),
    },
    {
        icon: <ShoppingCart className="size-8 text-primary" />,
        title: "Smart Grocery Lists",
        description: "Generate grocery lists based on your meal plans and pantry items.",
        image: PlaceHolderImages.find((img) => img.id === "grocery"),
    },
    {
        icon: <CalendarDays className="size-8 text-primary" />,
        title: "Interactive Meal Planning",
        description: "Drag and drop recipes onto your weekly calendar.",
        image: PlaceHolderImages.find((img) => img.id === "planner"),
    },
    {
        icon: <Warehouse className="size-8 text-primary" />,
        title: "Pantry Management",
        description: "Track what you have and get alerts when you're low.",
        image: PlaceHolderImages.find((img) => img.id === "pantry"),
    },
    {
        icon: <Heart className="size-8 text-primary" />,
        title: "Community Recipes",
        description: "Share your creations and discover new favorites.",
        image: PlaceHolderImages.find((img) => img.id === "community"),
    },
];

export default function LandingPage() {
    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <header className="container z-10 mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <ChefHat className="size-8 text-primary" />
                        <span className="font-headline text-xl font-bold tracking-tight">
                            MunchMates
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                            <Link href="/register">Get Started</Link>
                        </Button>
                    </div>
                </nav>
            </header>

            <main className="flex-1">
                <section className="relative w-full py-20 md:py-32">
                    <div className="absolute inset-0">
                        {heroImage && (
                            <Image
                                src={heroImage.imageUrl}
                                alt={heroImage.description}
                                fill
                                className="object-cover"
                                data-ai-hint={heroImage.imageHint}
                                priority
                            />
                        )}
                        <div className="absolute inset-0 bg-background/70" />
                    </div>
                    <div className="relative container mx-auto px-4 text-center sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl">
                            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary-foreground text-shadow sm:text-5xl md:text-6xl" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
                                Mealtime, Made Easy
                            </h1>
                            <p className="mt-6 max-w-xl mx-auto text-lg text-primary-foreground/90 font-medium" style={{textShadow: '0 1px 2px rgba(0,0,0,0.2)'}}>
                                Discover recipes, plan your meals, and shop smarter. MunchMates is your all-in-one kitchen assistant.
                            </p>
                            <div className="mt-10 flex justify-center">
                                <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                                <Link href="/dashboard">
                                    Start Cooking <ArrowRight className="ml-2" />
                                </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-16 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <Badge variant="outline" className="text-sm font-medium border-primary text-primary">Features</Badge>
                            <h2 className="mt-4 font-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Everything You Need to Eat Well
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
                                From finding the perfect dish to managing your pantry, we've got you covered.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <Card key={feature.title} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                    {feature.image && (
                                        <div className="aspect-video w-full overflow-hidden">
                                            <Image
                                                src={feature.image.imageUrl}
                                                alt={feature.image.description}
                                                width={600}
                                                height={400}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                data-ai-hint={feature.image.imageHint}
                                            />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            {feature.icon}
                                            <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-foreground/80">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-secondary">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <ChefHat className="size-6 text-secondary-foreground" />
                            <span className="font-bold text-secondary-foreground">MunchMates</span>
                        </div>
                        <p className="text-sm text-secondary-foreground">&copy; {new Date().getFullYear()} MunchMates. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}


