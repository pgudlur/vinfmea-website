"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      router.push("/app");
      return;
    }
    setChecked(true);
  }, [user, router]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Checking permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
