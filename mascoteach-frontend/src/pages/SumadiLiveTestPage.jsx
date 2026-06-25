import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/services/api';
import { resolveAiBaseUrl } from '@/services/baseUrls';

const AI_BASE_URL = resolveAiBaseUrl();

async function readJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default function SumadiLiveTestPage() {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lastPayload, setLastPayload] = useState(null);

  const authSummary = useMemo(() => ({
    fullName: user?.fullName || user?.name || 'Unknown user',
    email: user?.email || '—',
    role: user?.role || user?.roleName || '—',
    subscriptionTier: user?.subscriptionTier || '—',
  }), [user]);

  async function sendRequest(path, options = {}) {
    const token = getToken();
    const response = await fetch(`${AI_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const payload = await readJsonSafely(response);
    setLastPayload(payload);

    if (!response.ok) {
      const message = typeof payload === 'object' && payload
        ? payload.message || payload.title || `Request failed (${response.status})`
        : payload || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return payload;
  }

  async function handleCreateSession() {
    setBusy(true);
    setError('');

    try {
      const payload = await sendRequest('/api/v1/mascot-live/session', {
        method: 'POST',
        body: JSON.stringify({
          displayName: user?.fullName || 'Mascoteach test user',
          language: 'vi',
        }),
      });

      setSession(payload?.data ?? null);
    } catch (err) {
      setError(err.message || 'Could not create a Sumadi test session.');
    } finally {
      setBusy(false);
    }
  }

  async function handleEndSession() {
    if (!session?.sessionId) return;

    setBusy(true);
    setError('');

    try {
      const payload = await sendRequest(`/api/v1/mascot-live/session/${session.sessionId}/end`, {
        method: 'POST',
      });

      setSession(payload?.data ?? null);
    } catch (err) {
      setError(err.message || 'Could not end the Sumadi test session.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            Internal debug
          </p>
          <h1 className="text-3xl font-black">Sumadi Live Test</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Tiny page to test auth + live-session quota flow without mic or WebRTC. Create a session,
            end it, and inspect the exact backend response.
          </p>
        </header>

        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold text-white">Current user</h2>
            <dl className="mt-3 space-y-2 text-sm text-slate-300">
              <div><dt className="font-semibold text-slate-400">Name</dt><dd>{authSummary.fullName}</dd></div>
              <div><dt className="font-semibold text-slate-400">Email</dt><dd>{authSummary.email}</dd></div>
              <div><dt className="font-semibold text-slate-400">Role</dt><dd>{authSummary.role}</dd></div>
              <div><dt className="font-semibold text-slate-400">Tier</dt><dd>{authSummary.subscriptionTier}</dd></div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCreateSession}
                disabled={busy}
                className="rounded-2xl bg-sky-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create test session
              </button>
              <button
                type="button"
                onClick={handleEndSession}
                disabled={busy || !session?.sessionId}
                className="rounded-2xl border border-slate-600 px-4 py-2 font-semibold text-white transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                End current session
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-bold text-white">Current session</h2>
            {session ? (
              <dl className="mt-3 space-y-2 text-sm text-slate-300">
                <div><dt className="font-semibold text-slate-400">Session ID</dt><dd>{session.sessionId}</dd></div>
                <div><dt className="font-semibold text-slate-400">Status</dt><dd>{session.status}</dd></div>
                <div><dt className="font-semibold text-slate-400">Model</dt><dd>{session.model || '—'}</dd></div>
                <div><dt className="font-semibold text-slate-400">Max duration</dt><dd>{session.maxDurationSeconds ?? '—'}s</dd></div>
                <div><dt className="font-semibold text-slate-400">Remaining daily quota</dt><dd>{session.remainingDailySeconds ?? 'unlimited'}{typeof session.remainingDailySeconds === 'number' ? 's' : ''}</dd></div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No session created yet.</p>
            )}
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-bold text-white">Last payload</h2>
            <pre className="mt-3 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-200">
              {JSON.stringify(lastPayload, null, 2) || 'null'}
            </pre>
          </article>
        </section>
      </div>
    </main>
  );
}
