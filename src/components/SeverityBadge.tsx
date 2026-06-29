import React from 'react';

interface SeverityBadgeProps {
  severity: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const cleanSeverity = (severity || 'Routine').trim();

  let colorClasses = 'bg-green-500/10 text-green-400 border border-green-500/20';
  if (cleanSeverity === 'Emergency') {
    colorClasses = 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse';
  } else if (cleanSeverity === 'Urgent') {
    colorClasses = 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
  } else if (cleanSeverity === 'Important') {
    colorClasses = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider font-display uppercase ${colorClasses}`}>
      {cleanSeverity}
    </span>
  );
};
