/**
 * player-api.ts
 *
 * Thin wrapper around the PlayerDB API for resolving Minecraft usernames
 * to UUID + avatar data.
 */

import type { MCUser } from "./store-utils";

interface PlayerDBResponse {
    success: boolean;
    data?: {
        player?: {
            username: string;
            raw_id: string;
        };
    };
}

/**
 * Fetches Minecraft player metadata for a given username.
 *
 * Returns null when:
 * - The username doesn't exist on Mojang's database
 * - The upstream API is unreachable or returns an error
 *
 * Does NOT throw — callers should handle null as "player not found".
 */
export async function fetchPlayerMeta(username: string): Promise<MCUser | null> {
    try {
        const res = await fetch(
            `https://playerdb.co/api/player/minecraft/${encodeURIComponent(username)}`
        );
        if (!res.ok) return null;

        const data = (await res.json()) as PlayerDBResponse;
        if (!data.success || !data.data?.player) return null;

        const { username: canonicalName, raw_id } = data.data.player;

        return {
            name: canonicalName,
            uuid: raw_id,
            // mc-heads.net provides consistently formatted 100px avatar images
            head: `https://mc-heads.net/avatar/${raw_id}/100`,
        };
    } catch {
        // Network errors or malformed JSON — treat as not found
        return null;
    }
}