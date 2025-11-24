// app/(app)/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DietaryDialog } from "@/components/ingredients/Dietary";
import {
    initKeycloak,
    ensureToken,
    getAccessTokenClaims,
} from "@/lib/keycloak";

type AccessTokenClaims = {
    sub?: string;
    email?: string;
    preferred_username?: string;
    name?: string;
};

const ProfilePage = () => {
    const router = useRouter();

    // gate to avoid calling APIs before Keycloak is ready
    const [authReady, setAuthReady] = useState(false);

    // Display-only from Keycloak
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // App-owned profile data
    const [favoriteCuisines, setFavoriteCuisines] = useState("");
    const [diets, setDiets] = useState<string[]>([]);
    const [intolerances, setIntolerances] = useState<string[]>([]);

    const [dietModal, setDietModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const openDiet = () => setDietModal(true);
    const closeDiet = () => setDietModal(false);

    // 1) Initialize Keycloak for this route and pull name/email
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const authed = await initKeycloak("login-required");
                if (!mounted || !authed) return;

                setAuthReady(true);

                // once authenticated, we can safely read token claims
                const claims = getAccessTokenClaims<AccessTokenClaims>();
                if (claims) {
                    setName(
                        claims.name ??
                        claims.preferred_username ??
                        claims.sub ??
                        ""
                    );
                    setEmail(claims.email ?? "");
                }
            } catch (err) {
                console.error("Error initializing Keycloak on profile page", err);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    // 2) After auth is ready, load profile from /api/profile
    useEffect(() => {
        if (!authReady) return;

        const loadProfile = async () => {
            try {
                const token = await ensureToken();
                if (!token) {
                    // not authenticated for some reason; don't spam 401s
                    return;
                }

                const res = await fetch("/api/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    console.error("Failed to load profile", res.status);
                    return;
                }

                const data = await res.json();
                setFavoriteCuisines(data.favoriteCuisines ?? "");
                setDiets(data.diets ?? []);
                setIntolerances(data.intolerances ?? []);
            } catch (err) {
                console.error("Error loading profile", err);
            }
        };

        loadProfile();
    }, [authReady]);

    // 3) Save profile back to /api/profile
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = await ensureToken();
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch("/api/profile", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    favoriteCuisines,
                    diets,
                    intolerances,
                }),
            });

            if (!res.ok) {
                console.error("Failed to save profile", res.status);
                setSaving(false);
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            console.error("Error saving profile", err);
            setSaving(false);
        }
    };

    const dietText =
        diets.length > 0 ? diets.join(", ") : "No dietary preferences selected";
    const intoleranceText =
        intolerances.length > 0
            ? intolerances.join(", ")
            : "No allergies listed";

    return (
        <div className="min-h-screen bg-background flex items-start justify-center px-4 py-16">
            <DietaryDialog
                isOpen={dietModal}
                closePopup={closeDiet}
                diets={diets}
                setDiets={setDiets}
                intolerances={intolerances}
                setIntolerances={setIntolerances}
            />

            <div className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-sm px-8 py-10">
                <h2 className="text-3xl font-semibold text-center mb-8 text-foreground">
                    My Profile
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Name (from Keycloak) */}
                    <div className="space-y-2">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-foreground"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            readOnly
                            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                        />
                    </div>

                    {/* Email (from Keycloak) */}
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-foreground"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            readOnly
                            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                        />
                    </div>

                    {/* Favorite Cuisines */}
                    <div className="space-y-2">
                        <p className="block text-sm font-medium text-foreground">
                            Favorite Cuisines
                        </p>
                        <input
                            type="text"
                            placeholder="e.g., Italian, Mexican"
                            value={favoriteCuisines}
                            onChange={(e) => setFavoriteCuisines(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>

                    {/* Dietary preferences */}
                    <div className="space-y-2">
                        <p className="block text-sm font-medium text-foreground">
                            Dietary preferences
                        </p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                readOnly
                                value={dietText}
                                className="flex-1 rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground shadow-inner"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="shrink-0"
                                onClick={openDiet}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="space-y-2">
                        <p className="block text-sm font-medium text-foreground">
                            Allergies
                        </p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                readOnly
                                value={intoleranceText}
                                className="flex-1 rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground shadow-inner"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="shrink-0"
                                onClick={openDiet}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Save Settings */}
                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={saving}>
                            {saving ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
