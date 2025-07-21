import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImageComponent = ({
  src,
  alt,
  className,
  fallbackSrc,
  placeholder,
  onLoad,
  onError,
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || "");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      setCurrentSrc(src);
    }
  }, [isInView, isLoaded, hasError, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      
      {!isLoaded && !hasError && (
        <div className={cn(
          "absolute inset-0 bg-muted animate-pulse",
          "flex items-center justify-center",
          className
        )}>
          <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
        </div>
      )}
      
      {hasError && !fallbackSrc && (
        <div className={cn(
          "absolute inset-0 bg-muted",
          "flex items-center justify-center text-muted-foreground text-xs",
          className
        )}>
          Failed to load
        </div>
      )}
    </div>
  );
};

export const LazyImage = memo(LazyImageComponent);