'use client';

import Image from 'next/image';

interface ProfilePictureProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg lg:w-20 lg:h-20 lg:text-3xl',
};

export default function ProfilePicture({
  avatarUrl,
  name,
  size = 'md',
  className = '',
}: ProfilePictureProps) {
  const initial = name?.charAt(0).toUpperCase() || '?';

  if (avatarUrl) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
      >
        <Image
          src={avatarUrl}
          alt={`Photo de profil de ${name}`}
          fill
          className="object-cover"
          sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : '80px'}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-custom-2 text-white flex items-center justify-center font-bold flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {initial}
      </span>
    </div>
  );
}
