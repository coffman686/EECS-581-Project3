// app/meal-planner/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart, Save } from 'lucide-react';

const MealPlanner = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    // state to hold the current week
    const [currentDate, setCurrentDate] = useState(new Date());

    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        return {
            start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
            end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
            fullRange: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
        };
    };

    const prevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const weekRange = getWeekRange(currentDate);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <AppHeader title="Meal Planner" />

                    <main className="flex-1 p-6 bg-muted/20">
                        <div className="max-w-7xl mx-auto space-y-6">
                            {/* Week Navigation */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <Button
                                            variant="outline"
                                            onClick={prevWeek}
                                            className="flex items-center gap-2"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous Week
                                        </Button>

                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold text-foreground">
                                                Meal Plan
                                            </h2>
                                            <p className="text-muted-foreground mt-1">
                                                {weekRange.fullRange}
                                            </p>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={nextWeek}
                                            className="flex items-center gap-2"
                                        >
                                            Next Week
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Meal Plan Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                                {days.map((day, dayIndex) => {
                                    const dayDate = new Date(currentDate);
                                    const dayOfWeek = dayDate.getDay();
                                    const diff = dayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + dayIndex;
                                    const currentDayDate = new Date(dayDate);
                                    currentDayDate.setDate(diff);

                                    return (
                                        <Card key={day} className="flex flex-col">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg text-center">
                                                    {day}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground text-center">
                                                    {currentDayDate.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </CardHeader>
                                            <CardContent className="flex-1 p-4 pt-0 space-y-3">
                                                {meals.map((meal) => (
                                                    <div
                                                        key={meal}
                                                        className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-3 hover:border-muted-foreground/40 transition-colors"
                                                    >
                                                        <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                                                            {meal}
                                                        </h4>
                                                        <div className="min-h-[80px] flex items-center justify-center bg-muted/30 rounded-md">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="flex items-center gap-2 text-xs"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Add Recipe
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <Button
                                    size="lg"
                                    className="flex items-center gap-2 min-w-[200px]"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Generate Grocery List
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex items-center gap-2 min-w-[200px]"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Plan
                                </Button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default MealPlanner;