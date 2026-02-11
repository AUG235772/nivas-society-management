import React from 'react';

const GlassCard = ({ title, subtitle, action, accent }) => {
  return (
    <div className="glass rounded-xl p-4 shadow-md border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-200/80">{subtitle}</div>
          <div className="text-2xl font-bold text-white mt-1">{title}</div>
        </div>
        {action && <div>{action}</div>}
      </div>
      {accent && <div className="mt-3 text-xs text-slate-200/70">{accent}</div>}
    </div>
  );
};

export default GlassCard;
