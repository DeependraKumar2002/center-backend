import User from '../models/User.js';
import Center from '../models/Center.js';
import UserSubmission from '../models/UserSubmission.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Count total users
        const totalUsers = await User.countDocuments();

        // Count total centers
        const totalCenters = await Center.countDocuments();

        // Count total submissions
        const totalSubmissions = await UserSubmission.countDocuments();

        // Optionally, you can also get counts with additional details
        const stats = {
            totalUsers,
            totalCenters,
            totalSubmissions,
            timestamp: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// Get detailed statistics with breakdown
export const getDetailedStats = async (req, res) => {
    try {
        // Count total users
        const totalUsers = await User.countDocuments();

        // Count total centers
        const totalCenters = await Center.countDocuments();

        // Count total submissions
        const totalSubmissions = await UserSubmission.countDocuments();

        // Get submission counts by state
        const submissionsByState = await UserSubmission.aggregate([
            {
                $lookup: {
                    from: 'centers', // This assumes your centers collection is named 'centers'
                    localField: 'centerData.centerCode',
                    foreignField: 'centerCode',
                    as: 'centerInfo'
                }
            },
            {
                $unwind: '$centerInfo'
            },
            {
                $group: {
                    _id: '$centerInfo.state',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    state: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Get submission counts by city
        const submissionsByCity = await UserSubmission.aggregate([
            {
                $lookup: {
                    from: 'centers',
                    localField: 'centerData.centerCode',
                    foreignField: 'centerCode',
                    as: 'centerInfo'
                }
            },
            {
                $unwind: '$centerInfo'
            },
            {
                $group: {
                    _id: '$centerInfo.city',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    city: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        const stats = {
            totalUsers,
            totalCenters,
            totalSubmissions,
            submissionsByState,
            submissionsByCity,
            timestamp: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching detailed stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching detailed statistics',
            error: error.message
        });
    }
};