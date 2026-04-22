import type { Attraction } from '../config';
import { attractions } from '../config';
import MagicVillage from "../assets/images/magic_village.png";
import MapIcon from "../assets/map/markers/attractions_marker.svg";

// Helper to resize and convert image to Base64 to keep payload size small
async function getResizedBase64(url: string, width: number, height: number): Promise<string> {
    if (typeof window === 'undefined') return url;

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw image with 'cover' aspect ratio
                const scale = Math.max(width / img.width, height / img.height);
                const x = (width / 2) - (img.width / 2) * scale;
                const y = (height / 2) - (img.height / 2) * scale;
                
                // Use white background for transparent images if any
                // If it's an icon, we might want transparency, so let's skip fillRect if width < 100
                if (width >= 100) {
                    ctx.fillStyle = "#13151a"; 
                    ctx.fillRect(0, 0, width, height);
                }
                
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }
            // Use PNG for small icons to preserve transparency, JPEG for larger popups
            const mime = width < 100 ? 'image/png' : 'image/jpeg';
            const quality = width < 100 ? 1 : 0.6;
            resolve(canvas.toDataURL(mime, quality));
        };
        img.onerror = () => {
            console.error("Failed to load image for resizing:", url);
            resolve(url);
        };
        img.src = url;
    });
}

const imageCache = new Map<string, string>();

async function getCachedImage(url: string, width: number, height: number): Promise<string> {
    const key = `${url}-${width}x${height}`;
    if (imageCache.has(key)) return imageCache.get(key)!;
    const result = await getResizedBase64(url, width, height);
    imageCache.set(key, result);
    return result;
}

// Icon configuration for each attraction type
const typeIcons: Record<string, any> = {
    ride: MapIcon,
    shop: MapIcon,
    parkour: MapIcon,
    // Add more types here if needed
};

// Design Constants - Matching global.css variables
const colors = {
    bgPrimary: "#0d0f14",
    bgSecondary: "#13151a",
    bgTertiary: "#1a1c23",
    bgQuaternary: "#22242c",
    primary: "hsl(197, 100%, 99%)",
    secondary: "#b4bacc",
    ingenia: "#f6ac10",
    discord: "#5865F2"
};

const commonStyles = {
    card: `width: 260px; font-family: 'Inter', sans-serif; background: ${colors.bgSecondary}; color: ${colors.primary}; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 8px 25px rgba(0,0,0,0.5);`,
    imageContainer: `position: relative; height: 130px; overflow: hidden;`,
    image: `width: 100%; height: 100%; object-fit: cover;`,
    overlay: `position: absolute; inset: 0; background: linear-gradient(to top, ${colors.bgSecondary}, transparent); z-index: 10;`,
    header: `position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; z-index: 20;`,
    title: `margin: 0; font-size: 1.1rem; font-weight: 800; color: ${colors.ingenia}; text-transform: uppercase; letter-spacing: -0.025em; line-height: 1;`,
    subcategory: `margin: 3px 0 0; font-size: 0.6rem; font-weight: 900; color: ${colors.secondary}; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.6;`,
    content: `padding: 12px; font-size: 0.8rem; line-height: 1.5; color: ${colors.secondary};`,
    statsContainer: `display: flex; gap: 8px; padding: 0 12px 12px;`,
    statItem: `flex: 1; background: ${colors.bgPrimary}; padding: 8px; border: 1px solid rgba(255,255,255,0.03); text-align: center; border-radius: 8px;`,
    statLabel: `font-size: 0.55rem; font-weight: 900; color: ${colors.secondary}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; opacity: 0.5;`,
    statValue: `font-size: 0.9rem; font-weight: 800; color: ${colors.primary};`
};

export const templates = {
    ride: (attraction: Attraction, mapImageBase64: string) => `
<div style="${commonStyles.card}">
    <div style="${commonStyles.imageContainer}">
        <img src="${mapImageBase64}" alt="${attraction.title}" style="${commonStyles.image}">
        <div style="${commonStyles.overlay}"></div>
        <div style="${commonStyles.header}">
            <p style="${commonStyles.subcategory}">${attraction.subcategory}</p>
            <p style="${commonStyles.title}">${attraction.title}</p>
        </div>
    </div>
    <div style="${commonStyles.content}">
        <p style="margin: 0; opacity: 0.9;">${attraction.description}</p>
    </div>
    <div style="${commonStyles.statsContainer}">
        <div style="${commonStyles.statItem}">
            <div style="${commonStyles.statLabel}">Time</div>
            <div style="${commonStyles.statValue}">${attraction.rideTime}<span style="font-size: 0.6rem; margin-left: 2px; opacity: 0.6;">min</span></div>
        </div>
        <div style="${commonStyles.statItem}">
            <div style="${commonStyles.statLabel}">${attraction.trackLabel || "Length"}</div>
            <div style="${commonStyles.statValue}">${attraction.trackLength}<span style="font-size: 0.6rem; margin-left: 2px; opacity: 0.6;">m</span></div>
        </div>
    </div>
</div>`,

    shop: (attraction: Attraction, mapImageBase64: string) => `
<div style="${commonStyles.card}">
    <div style="${commonStyles.imageContainer}">
        <img src="${mapImageBase64}" alt="${attraction.title}" style="${commonStyles.image}">
        <div style="${commonStyles.overlay}"></div>
        <div style="${commonStyles.header}">
            <p style="${commonStyles.subcategory}">${attraction.subcategory}</p>
            <p style="${commonStyles.title}">${attraction.title}</p>
        </div>
    </div>
    <div style="${commonStyles.content}">
        <p style="margin: 0; opacity: 0.9;">${attraction.description}</p>
    </div>
</div>`,

    parkour: (attraction: Attraction, mapImageBase64: string) => `
<div style="${commonStyles.card}">
    <div style="${commonStyles.imageContainer}">
        <img src="${mapImageBase64}" alt="${attraction.title}" style="${commonStyles.image}">
        <div style="${commonStyles.overlay}"></div>
        <div style="${commonStyles.header}">
            <p style="${commonStyles.subcategory}">${attraction.subcategory}</p>
            <p style="${commonStyles.title}">${attraction.title}</p>
        </div>
    </div>
    <div style="${commonStyles.content}">
        <p style="margin: 0; opacity: 0.9;">${attraction.description}</p>
    </div>
</div>`
};

// Generate complete BlueMap marker data
export async function generateBlueMapMarkers() {
    const markerData: any = {};

    for (const attraction of attractions) {
        const categoryKey = attraction.category.toLowerCase();

        if (!markerData[categoryKey]) {
            markerData[categoryKey] = {
                label: attraction.category,
                toggleable: true,
                defaultHidden: false,
                sorting: categoryKey === 'rides' ? 1 : categoryKey === 'shops' ? 2 : 3,
                markers: {}
            };
        }

        // Get the specific icon for this attraction type
        const iconAsset = typeIcons[attraction.type] || MapIcon;
        const iconBase64 = await getCachedImage(iconAsset.src, 48, 48);

        const imgSrc = attraction.mapImage?.src || MagicVillage.src;
        // Generate a medium version for the popup detail
        const popupBase64 = await getCachedImage(imgSrc, 300, 200);

        markerData[categoryKey].markers[attraction.id] = {
            type: "poi",
            position: attraction.position,
            anchor: { x: 0.5, y: 1 },
            label: attraction.title,
            icon: iconBase64, 
            detail: (templates as any)[attraction.type](attraction, popupBase64),
            sorting: 0,
            listed: true,
            minDistance: 0,
            maxDistance: 5000,
            classes: []
        };
    }

    return markerData;
}
