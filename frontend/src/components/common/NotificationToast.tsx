import React from 'react';
import { useAluna } from '../../context/AlunaContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toast } = useAluna();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-[#38BDF8]" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/60 bg-[#06233B] text-white';
      case 'warning':
        return 'border-amber-500/60 bg-[#06233B] text-white';
      case 'error':
        return 'border-red-500/60 bg-[#06233B] text-white';
      case 'info':
      default:
        return 'border-[#004B87] bg-[#06233B] text-white';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-in">
      <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 ${getBorderColor()}`}>
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 text-xs font-medium leading-relaxed">
          {toast.message}
        </div>
      </div>
    </div>
  );
};
