import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  className?: string;
  badge?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  bgElement?: React.ReactNode;
  hrefAction?: () => void;
  actionText?: string;
  children?: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  className,
  badge,
  title,
  description,
  icon,
  hrefAction,
  actionText = 'Explorar',
  children,
}) => {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#1E3E54] bg-white dark:bg-[#0D212E] p-6 sm:p-7 flex flex-col justify-between hover:border-[#004B87]/50 dark:hover:border-aluna-cyan/60 shadow-sm transition-colors',
        className
      )}
    >
      {/* Top Header */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-50 dark:bg-aluna-cyan/15 text-[#004B87] dark:text-aluna-cyan-300 border border-sky-200 dark:border-aluna-cyan/30">
              {badge}
            </span>
          )}
          {icon && (
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan">
              {icon}
            </div>
          )}
        </div>

        <h3 className="font-serif font-bold text-xl text-[#06233B] dark:text-white">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          {description}
        </p>

        {children}
      </div>

      {/* Bottom Action */}
      {hrefAction && (
        <div className="relative z-10 pt-5 mt-auto">
          <button
            onClick={hrefAction}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#004B87] dark:text-aluna-cyan hover:underline transition-colors"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
