import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const UrgencyBadge: React.FC<{ expiryDate?: string, redAlertClass?: string, staticSize?: number }> = ({ expiryDate, redAlertClass = "text-red-600", staticSize = 10 }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!expiryDate) return;
    
    const target = new Date(expiryDate).getTime();
    
    const updateTime = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0 && diff <= 48 * 60 * 60 * 1000) {
         setTimeLeft({
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
         });
      } else {
         setTimeLeft(null);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  if (!expiryDate) {
    return (
      <>
        <Clock size={staticSize} className="animate-pulse" />
        <span>Oferta Limitada</span>
      </>
    );
  }

  const now = new Date().getTime();
  const target = new Date(expiryDate).getTime();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (target < now) {
    return (
       <>
        <Clock size={staticSize} />
        <span>Oferta Expirada</span>
      </>
    );
  }

  if (diffDays <= 2 && timeLeft) {
    return (
      <>
        <Clock size={staticSize} className={`animate-pulse ${redAlertClass}`} />
        <span className={redAlertClass}>
          Expira en: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
      </>
    );
  }

  if (diffDays <= 15) {
    return (
      <>
        <Clock size={staticSize} className="animate-pulse" />
        <span>
          Expira en {diffDays} días
        </span>
      </>
    );
  }

  return (
    <>
      <Clock size={staticSize} className="animate-pulse" />
      <span>
        Solo por este mes
      </span>
    </>
  );
};
