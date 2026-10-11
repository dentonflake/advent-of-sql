"use client";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
export function DeleteAccount({ localPreview }: { localPreview: boolean }) {
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove(event: FormEvent) {
    event.preventDefault();
    if (confirmation !== "DELETE" || localPreview) return;
    setBusy(true);
    setError("");
    try {
      const result = await authClient.deleteUser({ callbackURL: "/" });
      if (result.error) {
        setError(
          "Please sign out and sign in again before deleting your account. This action requires a recent sign-in.",
        );
        setBusy(false);
      } else window.location.assign("/");
    } catch {
      setError("We couldn’t delete your account. Please try again.");
      setBusy(false);
    }
  }
  return (
    <section className="delete-panel">
      <h2>Delete your account</h2>
      <p>
        This permanently removes your account and all your saved stars. Your own
        workshop database is unaffected.
      </p>
      {localPreview ? (
        <p className="field-help">
          Account deletion is unavailable for the shared local preview learner.
        </p>
      ) : (
        <form onSubmit={remove}>
          <label htmlFor="delete-confirmation">Type DELETE to confirm</label>
          <input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            required
          />
          <button
            className="button danger-button"
            disabled={confirmation !== "DELETE" || busy}
          >
            {busy ? "Deleting…" : "Permanently delete account"}
          </button>
          {error && (
            <p className="form-message error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
