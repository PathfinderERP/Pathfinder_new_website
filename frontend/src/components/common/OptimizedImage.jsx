import React, { useState, useEffect } from "react";
import { getImageUrl } from "../../utils/imageUtils";

export const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`}></div>
);

/**
 * Optimized Image Component with Skeleton Loading and Focus Support
 * @param {string} src - Image URL (or path to be resolved by getImageUrl)
 * @param {boolean} priority - If true, image loads eagerly with high fetch priority (for Hero sections)
 */
export const FadeInImage = ({ src, alt, className, containerClassName = "", priority = false }) => {
    const [loaded, setLoaded] = useState(false);
    const fullSrc = getImageUrl(src);

    // If it's a priority image, we want it to start loading ASAP
    // We also avoid the skeleton "flash" if the image is already cached
    useEffect(() => {
        if (priority) {
            const img = new Image();
            img.src = fullSrc;
            if (img.complete) {
                setLoaded(true);
            }
        }
    }, [fullSrc, priority]);

    return (
        <div className={`relative overflow-hidden ${containerClassName || ""}`}>
            {!loaded && !priority && <Skeleton className={`absolute inset-0 w-full h-full rounded-none ${className}`} />}
            <img
                src={fullSrc}
                alt={alt}
                className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
                loading={priority ? "eager" : "lazy"}
                // @ts-ignore - fetchpriority is a valid experimental attribute
                fetchpriority={priority ? "high" : "auto"}
            />
        </div>
    );
};
