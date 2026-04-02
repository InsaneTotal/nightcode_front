"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const { usuario, authLoading } = useApp();
  const currentRole = usuario?.role?.id;
  const isAuthorized = allowedRoles.includes(String(currentRole || ""));

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.replace("/auth/login");
    }
  }, [authLoading, isAuthorized, router]);

  if (authLoading) return null;

  return isAuthorized ? children : null;
}
