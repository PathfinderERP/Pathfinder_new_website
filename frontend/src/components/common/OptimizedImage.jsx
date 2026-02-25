import React, { useState } from "react";

export const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`}></div>
);

export const FadeInImage = ({ src, alt, className, containerClassName = "" }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${containerClassName || className}`}>
            {!loaded && <Skeleton className="absolute inset-0 w-full h-full rounded-none" />}
            <img
                src={src}
                alt={alt}
                className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
                loading="lazy"
            />
        </div>
    );
};
