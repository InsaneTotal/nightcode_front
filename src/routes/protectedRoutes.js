"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();

  const safeAllowedRoles = useMemo(() => allowedRoles || [], [allowedRoles]);
  const storedRole =
    typeof window !== "undefined" ? localStorage.getItem("id_role") : null;
  const userRole = String(storedRole ?? "");
  const isAuthorized = safeAllowedRoles.map(String).includes(userRole);

  useEffect(() => {
    if (!storedRole || !isAuthorized) {
      router.replace("/auth/login");
    }
  }, [router, storedRole, isAuthorized]);

  if (!storedRole || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
