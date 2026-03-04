"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

const LIMIT = 3;

function getKey(tool: string) {
    return `lf_uses_${tool}`;
}

function getCount(tool: string): number {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem(getKey(tool)) || "0", 10);
}

function increment(tool: string): number {
    const next = getCount(tool) + 1;
    localStorage.setItem(getKey(tool), String(next));
    return next;
}

export function useGuestLimit(tool: string) {
    const [isGuest, setIsGuest] = useState(true);
    const [usesLeft, setUsesLeft] = useState(LIMIT);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        let mounted = true;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;
            if (session?.user) {
                setIsGuest(false);
                // Clear counter once logged in so returning users start fresh
                localStorage.removeItem(getKey(tool));
                setUsesLeft(LIMIT);
            } else {
                setIsGuest(true);
                setUsesLeft(Math.max(0, LIMIT - getCount(tool)));
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            if (session?.user) {
                setIsGuest(false);
                localStorage.removeItem(getKey(tool));
                setUsesLeft(LIMIT);
                setShowModal(false);
            } else {
                setIsGuest(true);
                setUsesLeft(Math.max(0, LIMIT - getCount(tool)));
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [tool]);

    /**
     * Call before performing the gated action.
     * Returns true  → action is allowed (proceed).
     * Returns false → limit reached (modal is shown, block the action).
     */
    const tryUse = useCallback((): boolean => {
        if (!isGuest) return true; // logged-in users always pass
        const current = getCount(tool);
        if (current >= LIMIT) {
            setShowModal(true);
            return false;
        }
        const next = increment(tool);
        setUsesLeft(Math.max(0, LIMIT - next));
        if (next >= LIMIT) {
            setShowModal(true);
        }
        return true;
    }, [isGuest, tool]);

    const closeModal = useCallback(() => setShowModal(false), []);

    return { isGuest, usesLeft, limit: LIMIT, tryUse, showModal, closeModal };
}
