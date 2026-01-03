import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Center from './models/Center.js';
import State from './models/State.js';
import City from './models/City.js';
import bcrypt from 'bcrypt';

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        // Wait a moment for the connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Checking for existing data...');

        // Count existing records
        const existingCenters = await Center.countDocuments();
        const existingStates = await State.countDocuments();
        const existingCities = await City.countDocuments();
        const existingUsers = await User.countDocuments();

        console.log(`Found ${existingCenters} existing centers, ${existingStates} states, ${existingCities} cities, ${existingUsers} users`);

        // Create sample states only if they don't exist
        const stateNames = ['Maharashtra', 'Gujarat', 'Delhi', 'Karnataka'];

        for (const stateName of stateNames) {
            const existingState = await State.findOne({ name: stateName });
            if (!existingState) {
                await State.create({ name: stateName });
                console.log(`State created: ${stateName}`);
            } else {
                console.log(`State already exists: ${stateName}`);
            }
        }

        const totalStates = await State.countDocuments();
        console.log('Total states after seeding:', totalStates);

        // Create sample cities only if they don't exist
        const cities = [
            { name: 'Mumbai', state: 'Maharashtra' },
            { name: 'Pune', state: 'Maharashtra' },
            { name: 'Ahmedabad', state: 'Gujarat' },
            { name: 'Surat', state: 'Gujarat' },
            { name: 'New Delhi', state: 'Delhi' },
            { name: 'Bangalore', state: 'Karnataka' }
        ];

        for (const city of cities) {
            const existingCity = await City.findOne({ name: city.name, state: city.state });
            if (!existingCity) {
                await City.create(city);
                console.log(`City created: ${city.name}, ${city.state}`);
            } else {
                console.log(`City already exists: ${city.name}, ${city.state}`);
            }
        }

        const totalCities = await City.countDocuments();
        console.log('Total cities after seeding:', totalCities);

        // Create sample centers only if they don't exist (checking by centerCode)
        const centers = [
            {
                centerCode: 'MH001',
                centerName: 'Mumbai Central Center',
                state: 'Maharashtra',
                city: 'Mumbai',
                submittedBy: 'admin'
            },
            {
                centerCode: 'MH002',
                centerName: 'Pune Branch Center',
                state: 'Maharashtra',
                city: 'Pune',
                submittedBy: 'admin'
            },
            {
                centerCode: 'GJ001',
                centerName: 'Ahmedabad Main Center',
                state: 'Gujarat',
                city: 'Ahmedabad',
                submittedBy: 'admin'
            },
            {
                centerCode: 'DL001',
                centerName: 'Delhi Headquarters',
                state: 'Delhi',
                city: 'New Delhi',
                submittedBy: 'admin'
            }
        ];

        let createdCentersCount = 0;
        for (const center of centers) {
            const existingCenter = await Center.findOne({ centerCode: center.centerCode });
            if (!existingCenter) {
                await Center.create(center);
                console.log(`Center created: ${center.centerCode} - ${center.centerName}`);
                createdCentersCount++;
            } else {
                console.log(`Center already exists: ${center.centerCode} - ${center.centerName}`);
            }
        }
        console.log('Centers created:', createdCentersCount);

        // Create sample users with hashed passwords only if they don't exist
        const users = [
            {
                username: 'admin',
                email: 'admin@example.com',
                password: await bcrypt.hash('admin123', 10)
            },
            {
                username: 'user1',
                email: 'user1@example.com',
                password: await bcrypt.hash('password123', 10)
            },
            {
                username: 'user2',
                email: 'user2@example.com',
                password: await bcrypt.hash('password456', 10)
            }
        ];

        let createdUsersCount = 0;
        for (const userData of users) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                await User.create(userData);
                console.log(`User created: ${userData.username} - ${userData.email}`);
                createdUsersCount++;
            } else {
                console.log(`User already exists: ${userData.username} - ${userData.email}`);
            }
        }
        console.log('Users created:', createdUsersCount);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();