import React from 'react';

const FlatSquare = ({ status, label }) => {
  const bg = status === 'occupied' ? 'bg-green-500' : status === 'empty' ? 'bg-gray-300' : 'bg-red-400';
  return (
    <div className={`w-20 h-20 rounded-md flex items-center justify-center ${bg} text-white font-semibold`}>{label}</div>
  );
};

const ApartmentMap = ({ flats = [] }) => {
  return (
    <div className="grid grid-cols-6 gap-3">
      {flats.map((f) => (
        <FlatSquare key={f.label} status={f.status} label={f.label} />
      ))}
    </div>
  );
};

export default ApartmentMap;
