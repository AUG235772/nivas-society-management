const Vehicle = require('../models/Vehicle');

// 1. Add Vehicle
exports.addVehicle = async (req, res) => {
    try {
        // Accept common field names
        const { vehicleNumber, vehicleType, modelName, vehicleModel } = req.body;

        // Validation
        if (!vehicleNumber) {
            return res.status(400).json({ message: "Vehicle Number is required" });
        }

        const existingVehicle = await Vehicle.findOne({ vehicleNumber, societyId: req.societyId });
        if (existingVehicle) {
            return res.status(400).json({ message: "Vehicle already registered in this society" });
        }

        const newVehicle = new Vehicle({
            vehicleNumber,
            vehicleType: vehicleType || '4 Wheeler',
            // Use provided model name or fallback
            modelName: modelName || vehicleModel || 'Unknown Model',
            parkingSlot: '', // Removed slot logic as requested
            owner: req.user.id, // Link to logged-in user
            societyId: req.societyId
        });

        await newVehicle.save();
        // Populate owner details immediately for the frontend
        await newVehicle.populate('owner', 'name flatNo phoneNumber');

        res.status(201).json(newVehicle);
    } catch (err) {
        console.error('Add vehicle error:', err);
        res.status(500).json({ message: "Server Error adding vehicle" });
    }
};

// 2. Get All Vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ societyId: req.societyId }).populate('owner', 'name phoneNumber flatNo');
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ message: "Error fetching vehicles" });
    }
};

// 3. Delete Vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

        // Check ownership: Allow if user is owner OR user is admin
        if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized to delete this vehicle" });
        }

        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ message: "Vehicle removed successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Error deleting vehicle" });
    }
};

// 4. Search Vehicle (Optional, for API usage)
exports.searchVehicle = async (req, res) => {
    try {
        const { plateNumber } = req.params;
        const vehicle = await Vehicle.findOne({ vehicleNumber: plateNumber.toUpperCase() })
            .populate('owner', 'name phoneNumber flatNo');
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ message: "Search Error" });
    }
};