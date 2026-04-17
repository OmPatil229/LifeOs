'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { Sidebar } from "../../components/layout/Sidebar";
import { TopBar } from "../../components/layout/TopBar";
import { OnboardingFlow } from "../../components/onboarding/OnboardingFlow";
import { Loader2 } from "lucide-react";

/**
 * App Layout — Monochromatic App Shell.
 * Provides the sidebar, topbar, and scrollable content area
 * for all authenticated application routes.
 * Includes Authentication Guard.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { token, user, fetchMe } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      if (!user) {
        try {
          await fetchMe();
        } catch (err) {
          router.push("/login");
          return;
        }
      }
      
      setIsVerifying(false);
    };

    verifyAuth();
  }, [token, user, fetchMe, router]);

  if (isVerifying) {
    return (
      <div className="layout-shell" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="pulse" size={32} />
      </div>
    );
  }

  // Strategic Onboarding Gate
  if (user && !user.hasOnboardingCompleted) {
    return <OnboardingFlow />;
  }

  return (
    <div className="layout-shell">

      <Sidebar />
      <main className="main-content">
        <TopBar />
        <div className="content-area">
          <div className="content-max-width">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

