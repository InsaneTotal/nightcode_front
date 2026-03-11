"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("id_role");

    if (!storedRole || !allowedRoles.includes(storedRole)) {
      router.replace("/auth/login");
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
    }, [router, allowedRoles]);

  if (authorized === null) return null;

  return authorized ? children : null;
}