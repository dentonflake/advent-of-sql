"use client";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
export function SignOut() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <span>
      <button
        className="text-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const result = await authClient.signOut();
            if (result.error) {
              setError("Could not sign out.");
              setBusy(false);
            } else window.location.assign("/");
          } catch {
            setError("Could not sign out. Please try again.");
            setBusy(false);
          }
        }}
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error && <span role="alert">{error}</span>}
    </span>
  );
}
