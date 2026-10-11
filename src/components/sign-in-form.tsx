"use client";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Mail } from "lucide-react";
export function SignInForm({
  google,
  email: emailEnabled,
  next,
}: {
  google: boolean;
  email: boolean;
  next: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function send(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await authClient.signIn.magicLink({
        email,
        callbackURL: next,
        errorCallbackURL: "/sign-in?error=link",
      });
      if (response.error)
        setError(
          "We couldn’t send your sign-in link. Please try again shortly.",
        );
      else setSent(true);
    } catch {
      setError("We couldn’t reach the workshop. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {google && (
        <button
          className="button google-button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const response = await authClient.signIn.social({
                provider: "google",
                callbackURL: next,
                errorCallbackURL: "/sign-in?error=google",
              });
              if (response.error) {
                setError("Google sign-in couldn’t start. Please try again.");
                setBusy(false);
              }
            } catch {
              setError("Google sign-in couldn’t start. Please try again.");
              setBusy(false);
            }
          }}
        >
          <span className="google-letter" aria-hidden="true">
            G
          </span>{" "}
          Continue with Google
        </button>
      )}
      {google && emailEnabled && (
        <div className="or-divider">
          <span>or use your email</span>
        </div>
      )}
      {emailEnabled &&
        (sent ? (
          <div className="email-sent" role="status">
            <Mail size={30} />
            <h3>Check your inbox.</h3>
            <p>
              Your sign-in link is on its way to <strong>{email}</strong>. It
              expires in 10 minutes.
            </p>
            <button className="text-button" onClick={() => setSent(false)}>
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={send}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button
              className="button primary full-width"
              disabled={busy}
              type="submit"
            >
              {busy ? "Sending your link…" : "Email me a sign-in link"}
              <ArrowRight size={17} />
            </button>
            <p className="field-help">
              No password to remember. Just a little link.
            </p>
          </form>
        ))}
      {!google && !emailEnabled && (
        <div className="notice">
          <p>
            Sign-in is being prepared. You can explore the challenges and
            download your database in the meantime.
          </p>
        </div>
      )}
      {error && (
        <p className="form-message error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
