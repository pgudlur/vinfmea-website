"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const isInitialized = useAuth((s) => s.isInitialized);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) return;

    // Not logged in → redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Not admin → redirect to dashboard
    if (user.role !== "admin") {
      router.push("/app");
      return;
    }

    setChecked(true);
  }, [user, isInitialized, router]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Checking permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
