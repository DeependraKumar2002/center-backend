import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Register admin
export const registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { username }]
        });

        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists with this email or username' });
        }

        // Hash password manually before creating admin
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new admin
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword
        });

        const savedAdmin = await newAdmin.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: savedAdmin._id, username: savedAdmin.username, email: savedAdmin.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Admin registered successfully',
            admin: { id: savedAdmin._id, username: savedAdmin.username, email: savedAdmin.email },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Login admin
export const loginAdmin = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        // Check for admin by email or username
        let admin;
        if (identifier.includes('@')) {
            // If input contains '@', treat it as email
            admin = await Admin.findOne({ email: identifier });
        } else {
            // Otherwise, treat it as username
            admin = await Admin.findOne({ username: identifier });
        }

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({ message: 'Admin account is deactivated' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Admin login successful',
            admin: { id: admin._id, username: admin.username, email: admin.email },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            admin
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        const admin = await Admin.findByIdAndUpdate(
            req.user.id,
            { username, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            message: 'Admin profile updated successfully',
            admin
        });
    } catch (error) {
        console.error('Update admin profile error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// Change admin password
export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found'
            });
        }

        // Check current password
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change admin password error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// Get all admins (for superadmin use)
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');

        res.status(200).json({
            admins
        });
    } catch (error) {
        console.error('Get all admins error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};