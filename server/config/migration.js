const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Society = require('../models/Society');
const Bill = require('../models/Bill');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Visitor = require('../models/Visitor');
const Vehicle = require('../models/Vehicle');
const SOS = require('../models/SOS');

const migrateData = async () => {
    try {
        console.log("🔄 Checking for Data Migration...");

        // 1. Create Default Society if not exists
        let defaultSociety = await Society.findOne({ name: 'Nivas Shine Society' });
        if (!defaultSociety) {
            defaultSociety = new Society({
                name: 'Nivas Shine Society',
                address: 'Data Migration Default Address',
                adminEmail: 'admin@nivasshine.com',
                secretKey: 'DEFAULT_SECRET_KEY',
                isActive: true
            });
            await defaultSociety.save();
            console.log("✅ Created Default Society: Nivas Shine Society");
        } else {
            console.log("ℹ️ Default Society exists.");
        }

        // 2. Create Developer Account if not exists
        let dev = await User.findOne({ email: 'dev02@gmail.com' });
        if (!dev) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash('dev02', salt);
            dev = new User({
                name: 'Developer',
                email: 'dev02@gmail.com',
                password: hashed,
                role: 'developer',
                flatNo: 'DEV-001',
                phoneNumber: '0000000000',
                societyId: defaultSociety._id // Developer belongs to default or null? Default for now to avoid errors.
            });
            await dev.save();
            console.log("✅ Created Developer Account: dev02@gmail.com");
        } else {
            console.log("ℹ️ Developer Account exists.");
        }

        // 3. Migrate Users (Assign default society if missing)
        const userResult = await User.updateMany(
            { societyId: { $exists: false } },
            { $set: { societyId: defaultSociety._id } }
        );
        if (userResult.modifiedCount > 0) console.log(`✅ Migrated ${userResult.modifiedCount} Users.`);

        // 4. Migrate Other Collections
        const models = [
            { model: Bill, name: 'Bills' },
            { model: Complaint, name: 'Complaints' },
            { model: Notice, name: 'Notices' },
            { model: Visitor, name: 'Visitors' },
            { model: Vehicle, name: 'Vehicles' },
            { model: SOS, name: 'SOS' }
        ];

        for (const m of models) {
            const res = await m.model.updateMany(
                { societyId: { $exists: false } },
                { $set: { societyId: defaultSociety._id } }
            );
            if (res.modifiedCount > 0) console.log(`✅ Migrated ${res.modifiedCount} ${m.name}.`);
        }

        console.log("✨ Migration Check Complete.");

    } catch (err) {
        console.error("❌ Migration Failed:", err);
    }
};

module.exports = migrateData;
