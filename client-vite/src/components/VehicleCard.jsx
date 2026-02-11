import React from 'react';
import { Phone, Car, MapPin } from 'lucide-react'; // Icons ke liye

const VehicleCard = ({ vehicle }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{vehicle.vehicleNumber}</h3>
          <p className="text-sm text-gray-500 font-medium">{vehicle.modelName || "Unknown Model"}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${vehicle.vehicleType === '4W' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}> 
          {vehicle.vehicleType}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-gray-600 text-sm">
          <Car size={16} className="mr-2" />
          <span>Slot: <span className="font-semibold text-black">{vehicle.parkingSlot}</span></span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin size={16} className="mr-2" />
          <span>Owner: {vehicle.owner?.name} ({vehicle.owner?.flatNo})</span>
        </div>
      </div>

      <a 
        href={`tel:${vehicle.owner?.phoneNumber}`} 
        className="mt-4 flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        <Phone size={18} className="mr-2" />
        Call Owner
      </a>
    </div>
  );
};

export default VehicleCard;