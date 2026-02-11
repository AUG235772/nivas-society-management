import React from 'react';

const VisitorTimeline = ({ entries = [] }) => {
  return (
    <div className="space-y-6">
      {entries.map((e) => (
        <div key={e._id} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${e.status === 'Inside' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="w-px bg-slate-300 h-full" />
          </div>
          <div className="bg-white/60 p-3 rounded shadow-sm flex-1">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{e.name} <span className="text-xs text-slate-500">({e.flatNo})</span></div>
              <div className="text-xs text-slate-400">{new Date(e.entryTime).toLocaleString()}</div>
            </div>
            <div className="text-sm text-slate-600 mt-1">{e.purpose}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VisitorTimeline;
