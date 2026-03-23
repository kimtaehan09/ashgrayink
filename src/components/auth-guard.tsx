
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (loading) {
            return; // Don't do anything while loading.
        }

        // If not logged in and not on the login page, redirect to login.
        if (!user && pathname !== '/admin/login') {
            router.replace('/admin/login');
        }

        // If logged in and on the login page, redirect to the admin dashboard.
        if (user && pathname === '/admin/login') {
            const returnTo = searchParams.get('returnTo') ?? '/admin';
            router.replace(returnTo);
        }
    }, [user, loading, router, pathname, searchParams]);

    // While loading, show a full-screen loader.
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // If there is no user and we are not on the login page, we show nothing while redirecting.
    if (!user && pathname !== '/admin/login') {
        return null;
    }

    // Render children only when loading is complete and user state is determined.
    return <>{children}</>;
}
