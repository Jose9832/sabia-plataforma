import React from 'react';
import { cn } from '../../lib/utils';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col space-y-3', className)}>
      {children}
    </div>
  );
};
