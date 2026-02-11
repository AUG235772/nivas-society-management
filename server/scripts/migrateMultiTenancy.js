const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Society = require('../models/Society');
const Bill = require('../models/Bill');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const SOS = require('../models/SOS');
const Visitor = require('../models/Visitor');
const Vehicle = require('../models/Vehicle');
const bcrypt = require('bcryptjs');

// Load env vars
// FIX: path should be .env if running from server directory
dotenv.config({ path: '.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Create Default Society
        let society = await Society.findOne({ name: 'Nivas Shine Society' });
        if (!society) {
            society = await Society.create({
                name: 'Nivas Shine Society',
                address: 'Default Address',
                adminEmail: 'admin@nivasshine.com',
                secretKey: 'default-secret-key',
                isActive: true
            });
            console.log('Default Society Created:', society.name);
        } else {
            console.log('Default Society already exists:', society.name);
        }

        // 2. Assign Society to Existing Users
        const userResult = await User.updateMany(
            { role: { $in: ['admin', 'resident'] }, societyId: { $exists: false } },
            { $set: { societyId: society._id } }
        );
        console.log(`Updated ${userResult.modifiedCount} users with societyId`);

        // 3. Assign Society to Other Models
        // Helper function to update models
        const updateModel = async (Model, modelName) => {
            const result = await Model.updateMany(
                { societyId: { $exists: false } },
                { $set: { societyId: society._id } }
            );
            console.log(`Updated ${result.modifiedCount} ${modelName} with societyId`);
        };

        await updateModel(Bill, 'Bills');
        await updateModel(Complaint, 'Complaints');
        await updateModel(Notice, 'Notices');
        await updateModel(SOS, 'SOS Requests');
        await updateModel(Visitor, 'Visitors');
        await updateModel(Vehicle, 'Vehicles');

        // 4. Create Developer Account
        const devEmail = 'dev02@gmail.com';
        let devUser = await User.findOne({ email: devEmail });
        if (!devUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('dev02', salt);
            devUser = await User.create({
                name: 'Developer',
                email: devEmail,
                password: hashedPassword,
                role: 'developer',
                // No societyId for developer
            });
            console.log('Developer Account Created:', devEmail);
        } else {
            console.log('Developer Account already exists');
        }

        console.log('Migration Complete');
        process.exit();
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
};

migrate();
