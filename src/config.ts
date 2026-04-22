import MagicVillage from "./assets/images/magic_village.png";
import Discord from "./assets/icons/discord.svg";
import Insta from "./assets/icons/insta.svg";
import Youtube from "./assets/icons/youtube.svg";
import Tiktok from "./assets/icons/tiktok.svg";
import Minecraft from "./assets/icons/minecraft.svg";

export const DOMAIN = "http://localhost:4321";

export const SERVER_IP = "play.IngeniaMC.org";
export const SERVER_VERSION = "1.21.11"
export const DISCORD_SERVER_ID = "809319930754498580"

export const BLUEMAP_URL = "https://map.ingeniamc.org/";

export const COPYRIGHT_DATE= new Date().getFullYear();

export const INSTA_URL = "https://www.instagram.com/ingenia_mc/";
export const DISCORD_URL = "https://discord.gg/GdMdEmxWv5";
export const YOUTUBE_URL = "https://www.youtube.com/@Ingenia_MC";
export const TIKTOK_URL = "https://www.tiktok.com/@ingeniamc";
export const CONTACT_EMAIL = "AskJortToAdd@Email.com"

export const STRIPE_PUBLISHABLE_KEY = "pk_test_51TNTgaGWxFuNXKDXobbOdiJZruq7hahb5mjZwm3hFFKI0lSEt42e1JHiQZxtrAQRIR8TBWOAlZnIFEvQH9l4ZcLk00MwRcJhz5";

// /socials page
export const SOCIAL_LINKS = [
    {
        name: "Discord",
        url: DISCORD_URL,
        icon: Discord,
        color: "#5865F2",
        description: "Join our community for news and events"
    },
    {
        name: "Instagram",
        url: INSTA_URL,
        icon: Insta,
        color: "#E4405F",
        description: "Behind the scenes and park photos"
    },
    {
        name: "YouTube",
        url: YOUTUBE_URL,
        icon: Youtube,
        color: "#FF0000",
        description: "Watch our cinematic trailers and updates"
    },
    {
        name: "TikTok",
        url: TIKTOK_URL,
        icon: Tiktok,
        color: "#00f2ea",
        description: "Short clips and fun moments"
    },
    {
        name: "Live Map",
        url: "/map",
        icon: Minecraft,
        color: "#55FF55",
        description: "View our park in real-time"
    }
];

export const SNOW_CONFIG = {
    enabled: true,
    forceEnable: false,
    flakeCount: 200,
    maxRadius: 3.5,
    wind: -1,
    color: "#ddf",
    minSpeed: 1,
    maxSpeed: 2.5,
    stickingRatio: 5,
    maxHeightRatio: 0.25,
    monthDayRange: "12/15-01/05", // 15 December until the 5th of January
    zIndex: 50
};

export const TEAM_MEMBERS = {
    leaders: [
        { name: 'M64DiamondStar', rank: 'Lead', color: '#992E22' },
        { name: 'AvontuurierGamer', rank: 'Lead', color: '#992E22' }
    ],
    staff: [
        { name: '_JortieBoyNL_', rank: 'Team Manager', color: '#4180BF' },
        { name: 'QuestDarwin', rank: 'Team', color: '#4180BF' },
        { name: 'Mag1c_Turtle', rank: 'Team', color: '#4180BF' },
        { name: 'Pizzachen', rank: 'Team', color: '#4180BF' }
    ]
};

export interface Attraction {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    description: string;
    image: any;
    mapImage: any;
    videoUrl: string;
    position: { x: number; y: number; z: number };
    type: "ride" | "shop" | "parkour";
    trackLength?: string;
    trackLabel?: string;
    rideTime?: string;
}

export const attractions: Attraction[] = [
    {
        id: "wizard-waters",
        title: "Wizard Waters",
        category: "Rides",
        subcategory: "River Rapids",
        description: "A spectacular water ride where you will go on an adventure in the caves of the goblins but watch out for falling rocks!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: -70.5, y: 60, z: 26.5 },
        type: "ride",
        trackLength: "558",
        trackLabel: "Track Length",
        rideTime: "2:46"
    },
    {
        id: "enchanted-flight",
        title: "Enchanted Flight",
        category: "Rides",
        subcategory: "Suspended Flight",
        description: "A beautiful but slow ride which goes over the enchanted area know as Magic Village.",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: -57.5, y: 20, z: -32.5 },
        type: "ride",
        trackLength: "652",
        trackLabel: "Track Length",
        rideTime: "4:19"
    },
    {
        id: "dragons-obelisk",
        title: "Dragon's Obelisk",
        category: "Rides",
        subcategory: "Free Fall",
        description: "Reach heights that only dragons are able to reach on the powerful and magical obelisk, protected by the dragon tamer clan!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: -248.5, y: 60, z: 29.5 },
        type: "ride",
        trackLength: "60",
        trackLabel: "Height",
        rideTime: "1:00"
    },
    {
        id: "sakura-swirl",
        title: "Sakura Swirl",
        category: "Rides",
        subcategory: "Duelling Coaster",
        description: "A fast duelling coaster based in the Yin & Yang. Who will win the race is it Yin or is it Yang?",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: -152.5, y: 140, z: 319.5 },
        type: "ride",
        trackLength: "873",
        trackLabel: "Track Length",
        rideTime: "1:00"
    },
    {
        id: "rapids-of-mayhem",
        title: "Rapids of Mayhem",
        category: "Rides",
        subcategory: "Launch Coaster",
        description: "A launch coaster through the whole Vina Tropica area but watch out for the trees!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 128.5, y: 140, z: 164.5 },
        type: "ride",
        trackLength: "1168",
        trackLabel: "Track Length",
        rideTime: "1:15"
    },
    {
        id: "canoe-tour",
        title: "Canoe Tour",
        category: "Rides",
        subcategory: "Boat Ride",
        description: "A slow ride that will go through the whole Vina Tropica area. Do you have the patience for the whole ride?",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 236.5, y: 180, z: 199.5 },
        type: "ride",
        trackLength: "554",
        trackLabel: "Track Length",
        rideTime: "8:47"
    },
    {
        id: "wooden-coaster",
        title: "Wooden Coaster",
        category: "Rides",
        subcategory: "Wooden Coaster",
        description: "A roller coaster entirely made out of wood! Let's hope that it doesn't collapse!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 221.5, y: 80, z: 20.5 },
        type: "ride",
        trackLength: "817",
        trackLabel: "Track Length",
        rideTime: "1:56"
    },
    {
        id: "sand-snake",
        title: "Sand Snake",
        category: "Rides",
        subcategory: "Steel Coaster",
        description: "Go on an adventure and find the hidden sand snake that lives deep in the mountains of Sandy Town.",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 163.5, y: 60, z: -13.5 },
        type: "ride",
        trackLength: "921",
        trackLabel: "Track Length",
        rideTime: "1:33"
    },
    {
        id: "pyraculus",
        title: "Pyraculus",
        category: "Rides",
        subcategory: "Dark Ride",
        description: "A slow dark ride where you will go on an adventure and learn about the creatures that lived in the pyramid of Sandy Town.",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 74.5, y: 40, z: -15.5 },
        type: "ride",
        trackLength: "355",
        trackLabel: "Track Length",
        rideTime: "3:20"
    },

    // SHOPS
    {
        id: "quantum-quotables-quarters",
        title: "Quantum Quotables Quarters",
        category: "Shops",
        subcategory: "Title Shop",
        description: "The shop where you can buy the coolest titles & join messages!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: -10.5, y: 80, z: 73.5 },
        type: "shop"
    },
    {
        id: "ling-bao-kimonos",
        title: "Ling Bao Kimonos",
        category: "Shops",
        subcategory: "Clothing Shop",
        description: "Cheap but good looking clothing for your adventures in Sakura Valley!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: -132.5, y: 100, z: 224.5 },
        type: "shop"
    },
    {
        id: "dumbeldores-hats",
        title: "Dumbledores Hats",
        category: "Shops",
        subcategory: "Hats Shop",
        description: "The best hats for your adventure in the Magic Village area!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: -295.5, y: 40, z: 9.5 },
        type: "shop"
    },
    {
        id: "mummie-merch",
        title: "Mummie Merch",
        category: "Shops",
        subcategory: "Clothing Shop",
        description: "If you have always wanted to be a mummie take a look in this shop where you can buy the coolest mummie merch!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 89.5, y: 20, z: -39.5 },
        type: "shop"
    },
    {
        id: "tropical-hats",
        title: "Tropical Hats",
        category: "Shops",
        subcategory: "Hats Shop",
        description: "Hats to protect your head from the sun!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 237.5, y: 160, z: 186.5 },
        type: "shop"
    },

    // PARKOURS
    {
        id: "dragons-lair",
        title: "Dragon's Lair",
        category: "Parkours",
        subcategory: "Parkour",
        description: "A parkour in the mountains of Magic Village",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: -221.5, y: 20, z: -35 },
        type: "parkour"
    },
    {
        id: "haunted-shop",
        title: "Haunted Shop",
        category: "Parkours",
        subcategory: "Parkour",
        description: "A parkour in the sewers of the mainstreet",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 12, y: 100, z: 135 },
        type: "parkour"
    },
    {
        id: "dripleaf-parkour",
        title: "Dripleaf Parkour",
        category: "Parkours",
        subcategory: "Parkour",
        description: "If you fall you'll have wet feet!",
        image: MagicVillage,
        mapImage: MagicVillage,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        position: { x: 98, y: 120, z: 133.5 },
        type: "parkour"
    }
];

export interface StoreProduct {
    id: string;
    name: string;
    features: string[];
    detailedFeatures?: string[];
    price: string;
    originalPrice?: string;
    videoUrl?: string;
    stripeProductId: string;
    stripePriceId: string;
    image: any;
    category: 'rank' | 'wand';
}

export const STORE_PRODUCTS: StoreProduct[] = [
    {
        id: 'vip',
        name: 'VIP',
        features: [
            'Priority Queue',
            'Colored Chat Name',
            '3x Home Limit',
            'Exclusive Badge'
        ],
        detailedFeatures: [
            'Priority Queue Access',
            'Colored Chat Name',
            'Increased Home Limit',
            'Adventurer Badge',
            'Exclusive Particle Effects',
            'Custom Join Message',
            'Beta Server Access',
            'Discord VIP Role',
            'Monthly Bonus Keys',
            'Special Kit Access',
            'Auto-Replant Ability',
            'Flight in Hub',
            'Extended AFK Timer',
            'Nick Color Options',
            'Global Booster Active'
        ],
        price: '$20.99',
        originalPrice: '$24.99',
        stripeProductId: 'prod_RUGufqInNsWrdb',
        stripePriceId: 'price_1QbIMnGWjhmIDSsrrGrFIAGI',
        image: MagicVillage,
        category: 'rank',
    },
    {
        id: 'wand-fire-bundle',
        name: 'Fire Wand Bundle',
        features: [
            'Fire Wand',
            'Fire Trail Particle',
            'Phoenix Pet'
        ],
        detailedFeatures: [
            'The Original Fire Wand',
            'Fire Trail Particle',
            'Exclusive Phoenix Pet',
            'Immunity to Lava',
            'Custom Fire Spells',
            'Fiery Aura',
            'Burn Resistance',
            'Magma Walker Enchant',
            'Flame Shot Ability',
            'Volcano Summon',
            'Heat Wave Wave',
            'Eternal Ember',
            'Phoenix Rebirth Buff',
            'Molten Shield',
            'Inferno Blast'
        ],
        price: '€9.99',
        originalPrice: '€14.99',
        stripeProductId: 'prod_RUGufqInNsWrdb',
        stripePriceId: 'price_1QbIMnGWjhmIDSsrrGrFIAGI',
        image: MagicVillage,
        category: 'wand',
    },
];