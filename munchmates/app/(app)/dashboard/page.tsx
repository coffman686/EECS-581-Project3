'use client';
import RequireAuth from '@/components/RequireAuth';
import { ensureToken, getParsedIdToken, getAccessTokenClaims, logout, keycloak } from '@/lib/keycloak';
import { useEffect, useState } from 'react';
import { authedFetch } from '@/lib/authedFetch';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Button
} from '@/components/ui/button';
import {
    Badge
} from '@/components/ui/badge';
import {
    Users,
    Mail,
    Shield,
    LogOut,
    Key,
    Settings,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { DietaryDialog } from '@/components/ingredients/Dietary';

type IdClaims = { name?: string; preferred_username?: string; email?: string };
type AccessClaims = { preferred_username?: string; email?: string; realm_access?: { roles?: string[] } };

export default function Dashboard() {
    const [signedIn, setSignedIn] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roles, setRoles] = useState<string[]>([]);
    const [me, setMe] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // dietary prefernces launcher
    const [dietModal, setDietModal] = useState(false);
    const [diets, setDiets] = useState<string[]>([]);
    const [intolerances, setIntolerances] = useState<string[]>([]);

    useEffect(() => {
      const localDietsInit = localStorage.getItem("hasDietsInit");
      if (localDietsInit !== "true") {
        setDietModal(true);
      }
    }, []);

    function closeDiet(e: React.SyntheticEvent) {
      e.preventDefault();
      localStorage.setItem("hasDietsInit", "true");
      setDietModal(false);
    }

    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? '';
    const keycloakBase = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
    const mailpitUrl = process.env.NEXT_PUBLIC_MAILPIT_URL ?? 'http://localhost:8025';
    const adminUrl = `${keycloakBase}/admin/${realm}/console`;
    const accountUrl = `${keycloakBase}/realms/${realm}/account`;

    // hide system roles
    const hidden = new Set(['offline_access', 'uma_authorization', `default-roles-${realm}`]);
    const displayRoles = roles.filter(r => !hidden.has(r));

    useEffect(() => {
        let mounted = true;

        const readClaims = () => {
            const id  = (getParsedIdToken<IdClaims>() ?? {}) as IdClaims;
            const acc = (getAccessTokenClaims<AccessClaims>() ?? {}) as AccessClaims;
            setName(id.name || id.preferred_username || acc.preferred_username || '');
            setEmail(id.email || acc.email || '');
            setRoles(acc.realm_access?.roles ?? []);
        };

        (async () => {
            // RequireAuth already ensured we're logged in; just refresh token & reflect state
            await ensureToken();
            if (!mounted) return;

            setSignedIn(!!keycloak.token);  // <-- derive from token, not just keycloak.authenticated
            readClaims();
        })();

        // keep UI in sync if KC fires events slightly later (or on refresh)
        keycloak.onAuthSuccess = async () => {
            if (!mounted) return;
            await ensureToken();
            setSignedIn(!!keycloak.token);
            readClaims();
        };
        keycloak.onAuthRefreshSuccess = async () => {
            if (!mounted) return;
            await ensureToken();
            setSignedIn(!!keycloak.token);
            readClaims();
        };
        keycloak.onAuthLogout = () => {
            if (!mounted) return;
            setSignedIn(false);
            setName(''); setEmail(''); setRoles([]); setMe(null);
        };

        return () => {
            mounted = false;
            keycloak.onAuthSuccess = undefined;
            keycloak.onAuthRefreshSuccess = undefined;
            keycloak.onAuthLogout = undefined;
        };
    }, []);

    async function callMe() {
        setLoading(true);
        try {
            const res = await authedFetch('/api/me');
            if (!res.ok) return console.error('API error', res.status);
            const data = await res.json();
            setMe(data);
        } finally {
            setLoading(false);
        }
    }

    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="min-h-screen flex">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        <AppHeader title="Dashboard" />

                        <main className="flex-1 p-6 bg-muted/20">
                            <div className="max-w-6xl mx-auto space-y-6">
                                {/* Welcome Section */}
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {/* User Profile Card */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <Users className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">User Profile</CardTitle>
                                                <CardDescription>Account information</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Status</span>
                                                <Badge variant={signedIn ? "default" : "secondary"}>
                                                    {signedIn ? 'Signed In' : 'Signed Out'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Name</span>
                                                <span className="text-sm">{name || '—'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Email</span>
                                                <span className="text-sm">{email || '—'}</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Roles & Permissions */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <Shield className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">Roles & Permissions</CardTitle>
                                                <CardDescription>Assigned user roles</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {displayRoles.length > 0 ? (
                                                    displayRoles.map((role, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {role}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">No roles assigned</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Quick Actions */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <Settings className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                                                <CardDescription>Manage your account</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => window.open(accountUrl, '_blank')}
                                            >
                                                <Key className="h-4 w-4 mr-2" />
                                                Keycloak Account
                                                <ExternalLink className="h-3 w-3 ml-auto" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => window.open(adminUrl, '_blank')}
                                            >
                                                <Shield className="h-4 w-4 mr-2" />
                                                Keycloak Admin
                                                <ExternalLink className="h-3 w-3 ml-auto" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => window.open(mailpitUrl, '_blank')}
                                            >
                                                <Mail className="h-4 w-4 mr-2" />
                                                Mailpit
                                                <ExternalLink className="h-3 w-3 ml-auto" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* API Testing Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>API Testing</CardTitle>
                                        <CardDescription>
                                            Test your authenticated API endpoints
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                onClick={callMe}
                                                disabled={loading}
                                                className="flex items-center gap-2"
                                            >
                                                {loading ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="h-4 w-4" />
                                                )}
                                                Call /api/me
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => logout()}
                                                className="flex items-center gap-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </Button>
                                        </div>

                                        {me && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium mb-2">API Response:</h4>
                                                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-60">
                                                    {JSON.stringify(me, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* System Status */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Information</CardTitle>
                                        <CardDescription>
                                            Current environment configuration
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Realm</h4>
                                                <p className="text-sm text-muted-foreground">{realm}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Keycloak URL</h4>
                                                <p className="text-sm text-muted-foreground truncate">{keycloakBase}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Mailpit URL</h4>
                                                <p className="text-sm text-muted-foreground">{mailpitUrl}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                          <DietaryDialog
                            isOpen={dietModal}
                            closePopup={closeDiet}
                            diets={diets}
                            setDiets={setDiets}
                            intolerances={intolerances}
                            setIntolerances={setIntolerances}
                          />
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    );
}
