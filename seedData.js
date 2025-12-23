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

        // Clear existing data and indexes
        await User.collection.dropIndexes().catch(err => console.log('No indexes to drop for users'));
        await Center.collection.dropIndexes().catch(err => console.log('No indexes to drop for centers'));
        await State.collection.dropIndexes().catch(err => console.log('No indexes to drop for states'));
        await City.collection.dropIndexes().catch(err => console.log('No indexes to drop for cities'));

        await User.deleteMany({});
        await Center.deleteMany({});
        await State.deleteMany({});
        await City.deleteMany({});

        console.log('Cleared existing data and indexes');

        // Create sample states
        const states = [
            { name: 'Maharashtra' },
            { name: 'Gujarat' },
            { name: 'Delhi' },
            { name: 'Karnataka' }
        ];

        const savedStates = await State.insertMany(states);
        console.log('States created:', savedStates.length);

        // Create sample cities
        const cities = [
            { name: 'Mumbai', state: 'Maharashtra' },
            { name: 'Pune', state: 'Maharashtra' },
            { name: 'Ahmedabad', state: 'Gujarat' },
            { name: 'Surat', state: 'Gujarat' },
            { name: 'New Delhi', state: 'Delhi' },
            { name: 'Bangalore', state: 'Karnataka' }
        ];

        const savedCities = await City.insertMany(cities);
        console.log('Cities created:', savedCities.length);

        // Create sample centers
        const centers = [
            {
                centerCode: 'MH001',
                centerName: 'Mumbai Central Center',
                state: 'Maharashtra',
                city: 'Mumbai'
            },
            {
                centerCode: 'MH002',
                centerName: 'Pune Branch Center',
                state: 'Maharashtra',
                city: 'Pune'
            },
            {
                centerCode: 'GJ001',
                centerName: 'Ahmedabad Main Center',
                state: 'Gujarat',
                city: 'Ahmedabad'
            },
            {
                centerCode: 'DL001',
                centerName: 'Delhi Headquarters',
                state: 'Delhi',
                city: 'New Delhi'
            }
        ];

        const savedCenters = await Center.insertMany(centers);
        console.log('Centers created:', savedCenters.length);

        // Create sample users with hashed passwords
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

        const savedUsers = await User.insertMany(users);
        console.log('Users created:', savedUsers.length);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();