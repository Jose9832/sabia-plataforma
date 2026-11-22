import React from 'react';
import { cn } from '../../lib/utils';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export const BlurFade: React.FC<BlurFadeProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={cn('animate-fade-in-up transition-all', className)}
    >
      {children}
    </div>
  );
};
