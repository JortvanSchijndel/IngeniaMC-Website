/**
 * store-utils.ts
 *
 * Shared client-side utilities for the IngeniaMC store.
 */

// Types

export interface MCUser {
    name: string;
    uuid: string;
    head: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: string;
    /** Numeric value extracted from `price` for arithmetic. */
    priceValue: number;
    stripePriceId: string;
    image: string;
}

export type ToastType = "success" | "error" | "info";

// Toast

/**
 * Displays a non-blocking toast notification.
 */
export function showToast(msg: string, type: ToastType): void {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        Object.assign(container.style, {
            position: "fixed",
            top: "80px",
            right: "24px",
            zIndex: "9999",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            pointerEvents: "none",
        });
        document.body.appendChild(container);
    }

    const palette: Record<ToastType, string> = {
        success: "background:var(--ingenia);color:black;",
        error:   "background:#ef4444;color:white;",
        info:    "background:#3b82f6;color:white;",
    };

    const toast = document.createElement("div");
    toast.style.cssText = `
    ${palette[type]}
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    pointer-events: auto;
    transform: translateX(140%);
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    max-width: 280px;
    word-break: break-word;
  `;
    toast.textContent = msg;
    container.appendChild(toast);

    requestAnimationFrame(() =>
        requestAnimationFrame(() => (toast.style.transform = "translateX(0)"))
    );

    setTimeout(() => {
        toast.style.transform = "translateX(140%)";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Modal helpers

export function openModal(id: string | undefined): void {
    if (!id) return;
    const modal = document.getElementById("modal-" + id);
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
}

export function closeModal(modal: HTMLElement): void {
    modal.querySelector<HTMLElement>(".modal-panel, .relative")
        ?.classList.add("animate-modal-out");
    modal.querySelector<HTMLElement>(".modal-backdrop, #login-modal-backdrop")
        ?.classList.add("animate-fade-out");

    setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        modal
            .querySelector<HTMLElement>(".modal-panel, .relative")
            ?.classList.remove("animate-modal-out");
        modal
            .querySelector<HTMLElement>(".modal-backdrop, #login-modal-backdrop")
            ?.classList.remove("animate-fade-out");

        const cartOpen = !document.getElementById("cart-sidebar")
            ?.classList.contains("translate-x-full");
        const anyModalOpen =
            document.querySelectorAll('.product-modal:not(.hidden), #login-modal:not(.hidden)')
                .length > 0;

        if (!cartOpen && !anyModalOpen) {
            document.body.style.overflow = "";
        }
    }, 250);
}

// Price

export function parsePrice(str: string): number {
    return parseFloat(str.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
}

export function formatPrice(val: number): string {
    return "$" + val.toFixed(2);
}

// localStorage keys

export const MC_USERNAME_KEY = "ingeniamc_username_v1";
export const USER_META_KEY = "ingeniamc_user_meta_v1";
export const CART_STORAGE_KEY = "ingeniamc_cart_v2";
/** Cached list of product IDs owned by the current user. */
export const OWNED_PRODUCTS_KEY = "ingeniamc_owned_v1";