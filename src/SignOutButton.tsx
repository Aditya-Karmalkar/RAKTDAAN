"use client";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignOutButton() {
  const { signOut } = useAuthActions();

  return (
    <button
      className="px-4 py-2 rounded bg-white text-gray-600 border border-gray-200 font-semibold hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm hover:shadow"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
