'use client';

import { ICON_REGISTRY } from './iconRegistry';

interface IconProps {
  name: string;
  className?: string;
  size?: number | string;
  title?: string;
}

export default function Icon({ name, className = '', size = 20, title }: IconProps) {
  const SvgComponent = ICON_REGISTRY[name];

  if (!SvgComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found in registry`);
    }
    return null;
  }

  const sizeVal = typeof size === 'number' ? size : 20;

  return (
    <SvgComponent
      width={sizeVal}
      height={sizeVal}
      className={className}
      aria-hidden={!title}
      aria-label={title}
    />
  );
}
