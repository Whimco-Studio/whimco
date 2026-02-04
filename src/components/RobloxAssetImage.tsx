"use client";

import { useState, useEffect, useRef } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

interface RobloxAssetImageProps {
  assetId: number;
  size?: 150 | 420;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component to display Roblox asset thumbnails.
 * Uses the Roblox CDN or thumbnails API to fetch asset images.
 */
export default function RobloxAssetImage({
  assetId,
  size = 150,
  className = "",
  fallback,
}: RobloxAssetImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!assetId) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // Reset states when assetId changes
    setIsLoading(true);
    setHasError(false);

    // Try direct CDN URL first (works for most assets)
    // Format: https://rbxcdn.com/HASH or via thumbnails API
    const thumbnailUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=${size}x${size}&format=Png&isCircular=false`;

    // Fetch the thumbnail URL from Roblox API
    fetch(thumbnailUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.[0]?.imageUrl) {
          setImageUrl(data.data[0].imageUrl);
        } else {
          // Fallback to direct asset URL (may work for some assets)
          setImageUrl(
            `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`
          );
        }
      })
      .catch(() => {
        // If API fails, try direct asset delivery
        setImageUrl(
          `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`
        );
      });
  }, [assetId, size]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Observe when image enters viewport for lazy loading
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !imageUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = imageUrl;
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [imageUrl]);

  if (hasError) {
    return (
      fallback || (
        <div
          className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
          style={{ width: size, height: size }}
        >
          <PhotoIcon className="w-8 h-8 text-gray-300" />
        </div>
      )
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <PhotoIcon className="w-8 h-8 text-gray-300" />
        </div>
      )}

      {/* Actual image */}
      {imageUrl && (
        <img
          ref={imgRef}
          alt={`Roblox Asset ${assetId}`}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-contain transition-opacity duration-200 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
    </div>
  );
}
