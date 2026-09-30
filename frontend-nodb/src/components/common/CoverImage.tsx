import React from 'react';
import { useCoverUrl } from '../../hooks/useCoverUrl';
import { Music } from 'lucide-react';

interface CoverImageProps {
  coverId?: string;
  coverBlobUrl?: string; // Legacy fallback
  alt?: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const CoverImage: React.FC<CoverImageProps> = ({
  coverId,
  coverBlobUrl,
  alt = 'Cover Art',
  className = 'w-full h-full object-cover',
  fallbackIcon,
}) => {
  const url = useCoverUrl(coverId, coverBlobUrl);

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-white/5 text-vault-text-muted ${className}`}>
        {fallbackIcon || <Music className="w-1/2 h-1/2 opacity-40" />}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        // Hide broken image link
        (e.target as HTMLElement).style.display = 'none';
      }}
    />
  );
};
