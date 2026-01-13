/**
 * @file components/ui/Icon.tsx
 * @fileoverview SVG Icon component for displaying icons from public/icons directory.
 * 
 * This component provides a unified way to display SVG icons throughout the application.
 */

'use client';

import React from 'react';
import Image from 'next/image';

interface IconProps {
  name: 'add' | 'edit' | 'delete' | 'dashboard' | 'garage' | 'secure' | 'responsive' | 'conso' | 'settings' | 'car';
  className?: string;
  size?: number | string;
  color?: string;
  title?: string;
}

/**
 * Icon Component
 * 
 * Displays SVG icons from the public/icons directory.
 * Automatically handles icon loading and provides consistent styling.
 */
export default function Icon({ name, className = '', size = 20, color = 'currentColor', title }: IconProps) {
  const iconPath = `/icons/${name}.svg`;
  
  // Calculate size styles
  const sizeStyles = typeof size === 'number' 
    ? { width: size, height: size } 
    : { width: '1em', height: '1em', fontSize: size };

  return (
    <span 
      className={`inline-flex items-center justify-center ${className}`} 
      style={sizeStyles} 
      aria-hidden={!title} 
      title={title} 
    >
      <Image 
        src={iconPath} 
        alt={title || name} 
        className="w-full h-full object-contain dark:invert" 
        style={{ color }} 
        width={typeof size === 'number' ? size : 20} 
        height={typeof size === 'number' ? size : 20} 
        loading="lazy" 
      />
    </span>
  );
}