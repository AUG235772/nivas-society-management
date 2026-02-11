import React from 'react';

const IDCard = ({ user }) => {
  return (
    <div className="bg-white/5 p-3 rounded-lg shadow-sm flex items-center gap-3">
      <div className="w-12 h-12 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold">{user?.name?.[0]}</div>
      <div>
        <div className="text-sm font-bold text-white">{user?.name}</div>
        <div className="text-xs text-slate-300">{user?.flatNo || '—'}</div>
      </div>
    </div>
  );
};

export default IDCard;
