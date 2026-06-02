import { useState } from "react";
import { Drawer } from "vaul";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../store/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccountDrawer({ open, onOpenChange }: Props) {
  const user = useAuth((s) => s.user);
  const status = useAuth((s) => s.status);
  const signInWithEmail = useAuth((s) => s.signInWithEmail);
  const signInWithGoogle = useAuth((s) => s.signInWithGoogle);
  const signOut = useAuth((s) => s.signOut);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signedIn = status === "authenticated" && user != null;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setBusy(true);
    try {
      await signInWithEmail(email.trim());
      setMessage("Check your email for the sign-in link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setMessage(null);
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOut();
      setEmail("");
      setMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <button className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur transition active:scale-95 hover:bg-white/15">
          Account
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col rounded-t-3xl border-t border-white/10 bg-neutral-950/95 pb-safe outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/25" />
          <div className="px-6 pt-4">
            <Drawer.Title className="text-xl font-semibold text-white">
              Account
            </Drawer.Title>
            <Drawer.Description className="mt-1 text-sm text-white/50">
              {signedIn
                ? "Your breathing history syncs across devices."
                : "Sign in to sync your history to the cloud."}
            </Drawer.Description>
          </div>

          <div className="space-y-4 px-6 pb-8 pt-4">
            {!isSupabaseConfigured && (
              <p className="rounded-2xl bg-white/5 p-4 text-sm text-white/60">
                Cloud sync is not configured. Add{" "}
                <code className="text-accent">VITE_SUPABASE_URL</code> and{" "}
                <code className="text-accent">VITE_SUPABASE_ANON_KEY</code> to{" "}
                <code className="text-white/80">.env.local</code>. The app
                works fully offline without them.
              </p>
            )}

            {isSupabaseConfigured && signedIn && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/40">
                    Signed in as
                  </p>
                  <p className="mt-1 font-medium text-white">{user.email}</p>
                </div>
                <button
                  onClick={() => void handleSignOut()}
                  disabled={busy}
                  className="w-full rounded-full bg-white/10 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
                >
                  Sign out
                </button>
              </div>
            )}

            {isSupabaseConfigured && !signedIn && status !== "loading" && (
              <div className="space-y-4">
                <form onSubmit={(e) => void handleMagicLink(e)} className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-accent/50"
                  />
                  <button
                    type="submit"
                    disabled={busy || !email.trim()}
                    className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    Send magic link
                  </button>
                </form>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-white/40">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  onClick={() => void handleGoogle()}
                  disabled={busy}
                  className="w-full rounded-full bg-white/10 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
                >
                  Continue with Google
                </button>
              </div>
            )}

            {status === "loading" && isSupabaseConfigured && (
              <p className="text-center text-sm text-white/50">Loading…</p>
            )}

            {message && (
              <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
                {message}
              </p>
            )}
            {error && (
              <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
