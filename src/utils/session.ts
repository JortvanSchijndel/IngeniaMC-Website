/**
 * session.ts
 *
 * Client-side session management for the IngeniaMC store.
 *
 * Architecture:
 *   All session state lives in localStorage under namespaced keys. There are
 *   no cookies. The Minecraft username persists across browser restarts;
 *   resolved Mojang metadata (UUID, avatar) is cached alongside it to avoid
 *   redundant PlayerDB calls on every page load.
 *
 * Ownership data is NOT stored here. After login, store.astro fetches owned
 * products from /api/ownership (which reads from Stripe via KV), then hands
 * that data to the UI. The session module only cares about identity.
 *
 * Cross-island communication:
 *   Astro processes each <script> tag as an isolated bundle, so there is no
 *   shared module scope between component scripts. We attach public functions
 *   to `window` after registration — the idiomatic Astro pattern for this.
 *   All globals are clearly named to minimise collision risk.
 */

import { showToast, USER_META_KEY, MC_USERNAME_KEY, type MCUser } from "./store-utils";
import { fetchPlayerMeta } from "./player-api";

const USERNAME_RE = /^[a-zA-Z0-9_]{1,16}$/;

// Internal state

/** In-memory reference to the currently authenticated player. */
let currentUser: MCUser | null = null;

// localStorage helpers

/**
 * Reads a JSON-encoded value from localStorage.
 * Returns null on missing key or parse failure — never throws.
 */
function lsGet<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function lsSet(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage quota exceeded — silently degrade; the page still works
    }
}

function lsDelete(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore
    }
}

// UI sync

/**
 * Reflects the current auth state in the header login/avatar elements.
 * Idempotent — safe to call any number of times.
 */
export function syncHeaderUI(): void {
    const loginTrigger = document.getElementById("login-trigger");
    const userDisplay = document.getElementById("user-display");
    const userHead = document.getElementById("user-head") as HTMLImageElement | null;
    const userNameEl = document.getElementById("user-name-display");

    const loggedIn = !!currentUser;

    loginTrigger?.classList.toggle("hidden", loggedIn);
    userDisplay?.classList.toggle("hidden", !loggedIn);
    userDisplay?.classList.toggle("flex", loggedIn);

    if (userHead && currentUser) userHead.src = currentUser.head;
    if (userNameEl && currentUser) userNameEl.textContent = currentUser.name;
}

// Public API

export function getCurrentUser(): MCUser | null {
    return currentUser;
}

/**
 * Synchronously checks if a session exists in the cache and populates
 * the in-memory state. Used for immediate UI sync.
 */
export function restoreSessionSync(): MCUser | null {
    const stored = lsGet<{ username: string }>(MC_USERNAME_KEY);
    if (!stored?.username || !USERNAME_RE.test(stored.username)) return null;

    const cached = lsGet<MCUser>(USER_META_KEY);
    if (cached && cached.name.toLowerCase() === stored.username.toLowerCase()) {
        currentUser = cached;
        syncHeaderUI();
        return currentUser;
    }
    return null;
}

/**
 * Restores a session from localStorage on page load.
 *
 * Flow:
 *   1. Read the stored username. If absent → unauthenticated, return null.
 *   2. Check for cached MCUser metadata. If it matches the stored username
 *      → populate currentUser from cache (no network call needed).
 *   3. Otherwise fetch fresh metadata from PlayerDB. On success → cache it.
 *      On failure → the stored username is stale (account renamed/deleted);
 *      clear it so the user is prompted to re-authenticate.
 */
export async function restoreSession(): Promise<MCUser | null> {
    const syncResult = restoreSessionSync();
    if (syncResult) return syncResult;

    const stored = lsGet<{ username: string }>(MC_USERNAME_KEY);
    if (!stored?.username) return null;

    // Cache miss or username mismatch — fetch fresh metadata
    const meta = await fetchPlayerMeta(stored.username);
    if (meta) {
        currentUser = meta;
        lsSet(USER_META_KEY, meta);
        syncHeaderUI();
    } else {
        // Stale entry — wipe it so the forced-login modal triggers correctly
        clearStoredSession();
    }

    return currentUser;
}

/**
 * Validates a username against Mojang's API via PlayerDB, then persists the
 * session to localStorage on success.
 *
 * Returns the resolved MCUser, or null if the username is invalid / not found.
 * Toast messages are shown for all failure cases so callers need not duplicate
 * that logic.
 */
export async function login(username: string): Promise<MCUser | null> {
    if (!USERNAME_RE.test(username)) {
        showToast("Invalid username format.", "error");
        return null;
    }

    const meta = await fetchPlayerMeta(username);
    if (!meta) {
        showToast("Player not found. Check your username.", "error");
        return null;
    }

    currentUser = meta;
    lsSet(MC_USERNAME_KEY, { username: meta.name });
    lsSet(USER_META_KEY, meta);
    syncHeaderUI();
    return currentUser;
}

/**
 * Ends the current session: clears in-memory state and all localStorage keys
 * that belong to the session module.
 *
 * The cart is intentionally NOT cleared here — that is the cart module's
 * responsibility, called separately via `window.clearCart()` to avoid coupling.
 */
export function logout(): void {
    currentUser = null;
    clearStoredSession();
    syncHeaderUI();
}

/** Removes all session-related keys from localStorage. */
function clearStoredSession(): void {
    lsDelete(MC_USERNAME_KEY);
    lsDelete(USER_META_KEY);
}

// Global registration

/**
 * Attaches session functions to `window` so Astro island scripts (Cart,
 * store.astro, LoginModal) can call them without ESM import coupling.
 */
export function registerSessionGlobals(): void {
    (window as any).getCurrentUser = getCurrentUser;
    (window as any).restoreSession = restoreSession;
    (window as any).login = login;
    (window as any).logout = logout;
}