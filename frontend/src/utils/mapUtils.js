import { centerdata } from "../data/data";

/**
 * Generates a guaranteed working Google Maps Embed URL for iframes.
 * Prevents "The Google Maps Embed API must be used in an iframe" error.
 */
export const getMapEmbedUrl = (centre) => {
    if (!centre) return "";

    const raw = centre.location || centre.map_url || centre.google_map_url || centre.mapEmbed || "";

    // 1. If it contains an iframe HTML snippet, extract the src attribute
    if (typeof raw === "string" && (raw.includes("<iframe") || raw.includes("iframe"))) {
        const srcMatch = raw.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) return srcMatch[1];
    }

    // 2. If it's already a valid Google Maps embed URL with embed path
    if (typeof raw === "string" && raw.includes("google.com/maps/embed")) {
        return raw;
    }

    // 3. If raw URL has coordinates in protobuf pb (!3d{lat}!2d{lng})
    if (typeof raw === "string") {
        const latMatch = raw.match(/!3d\s*([-0-9.]+)/);
        const lngMatch = raw.match(/!2d\s*([-0-9.]+)/);
        if (latMatch && lngMatch) {
            const place = encodeURIComponent(centre.centre ? `Pathfinder Institute, ${centre.centre}` : "Pathfinder Institute");
            return `https://maps.google.com/maps?q=${place}&ll=${latMatch[1]},${lngMatch[1]}&z=15&output=embed`;
        }

        // 4. Coordinates in URL (@lat,lng or q=lat,lng)
        const atCoords = raw.match(/@([-0-9.]+),([-0-9.]+)/);
        if (atCoords) {
            return `https://maps.google.com/maps?q=${atCoords[1]},${atCoords[2]}&z=15&output=embed`;
        }

        const qCoords = raw.match(/q=([-0-9.]+),([-0-9.]+)/);
        if (qCoords) {
            return `https://maps.google.com/maps?q=${qCoords[1]},${qCoords[2]}&z=15&output=embed`;
        }

        if (raw.includes("output=embed")) {
            return raw;
        }
    }

    // 5. Match against static verified centerdata in data.js
    if (centerdata && Array.isArray(centerdata)) {
        const cName = (centre.centre || "").toLowerCase().trim();
        const found = centerdata.find(s => {
            const sName = (s.name || s.center || "").toLowerCase().trim();
            return cName.includes(sName) || sName.includes(cName);
        });
        if (found && found.mapEmbed) {
            return found.mapEmbed;
        }
    }

    // 6. Universal guaranteed embed format with output=embed
    const placeParts = [
        "Pathfinder Institute",
        centre.centre,
        centre.district,
        centre.state,
        "India"
    ].filter(Boolean);

    return `https://maps.google.com/maps?q=${encodeURIComponent(placeParts.join(", "))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

/**
 * Direct external navigation link for opening a centre in Google Maps
 * Converts embed links (!3d/!2d protobuf or /maps/embed) into standard clickable
 * Google Maps links to avoid "The Google Maps Embed API must be used in an iframe" error.
 */
export const getDirectMapLink = (centreOrUrl, fallbackUrl) => {
    if (!centreOrUrl) return "https://www.google.com/maps";

    let raw = "";
    let centreObj = null;

    if (typeof centreOrUrl === "string") {
        raw = centreOrUrl || fallbackUrl || "";
    } else if (typeof centreOrUrl === "object") {
        centreObj = centreOrUrl;
        raw = centreOrUrl.location || centreOrUrl.map_url || centreOrUrl.google_map_url || fallbackUrl || "";
    }

    if (typeof raw !== "string") {
        raw = "";
    }

    // 1. If wrapped in an iframe snippet, extract src
    if (raw.includes("<iframe") || raw.includes("iframe")) {
        const srcMatch = raw.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
            raw = srcMatch[1];
        }
    }

    const buildFallbackQuery = () => {
        if (centreObj) {
            const parts = [
                "Pathfinder Institute",
                centreObj.centre || centreObj.name,
                centreObj.district || centreObj.city,
                centreObj.state
            ].filter(Boolean);
            return parts.join(" ");
        }
        return "Pathfinder Institute";
    };

    // 2. If it is an Embed API URL or output=embed, Google strictly blocks opening it directly.
    // Convert it to a valid Google Maps search/location URL!
    if (raw.includes("/maps/embed") || raw.includes("google.com/maps/embed") || raw.includes("output=embed")) {
        // A. Extract coordinates from Google protobuf parameters: !3d[lat] and !2d[lng]
        const latMatch = raw.match(/!3d\s*([-0-9.]+)/);
        const lngMatch = raw.match(/!2d\s*([-0-9.]+)/);
        if (latMatch && lngMatch) {
            return `https://www.google.com/maps?q=${latMatch[1]},${lngMatch[1]}`;
        }

        // B. Extract coordinates from @lat,lng
        const atCoords = raw.match(/@([-0-9.]+),([-0-9.]+)/);
        if (atCoords) {
            return `https://www.google.com/maps?q=${atCoords[1]},${atCoords[2]}`;
        }

        // C. Extract coordinates from q=lat,lng
        const qCoords = raw.match(/[?&]q=([-0-9.]+),([-0-9.]+)/);
        if (qCoords) {
            return `https://www.google.com/maps?q=${qCoords[1]},${qCoords[2]}`;
        }

        // D. Extract q query parameter if present
        try {
            const urlObj = new URL(raw);
            const q = urlObj.searchParams.get("q");
            if (q) {
                return `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
            }
        } catch (e) {
            // Ignore URL parsing errors
        }

        // E. Fallback search by centre name and district
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildFallbackQuery())}`;
    }

    // 3. If it is a normal URL (e.g. goo.gl, maps.app.goo.gl, google.com/maps/place/...), return it
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
        return raw;
    }

    // 4. Default fallback search
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildFallbackQuery())}`;
};
