import Center from '../models/Center.js';
import UserSubmission from '../models/UserSubmission.js';
import moment from 'moment';

// Get all centers
export const getAllCenters = async (req, res) => {
    try {
        const centers = await Center.find().sort({ centerCode: 1 });
        res.json(centers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get centers by state
export const getCentersByState = async (req, res) => {
    try {
        const { state } = req.params;
        const centers = await Center.find({ state: state }).sort({ centerCode: 1 });
        res.json(centers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get centers by city
export const getCentersByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const centers = await Center.find({ city: city }).sort({ centerCode: 1 });
        res.json(centers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get center by center code
export const getCenterByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const center = await Center.findOne({ centerCode: code });
        if (!center) {
            return res.status(404).json({ message: 'Center not found' });
        }
        res.json(center);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get centers by name
export const getCentersByName = async (req, res) => {
    try {
        const { name } = req.params;
        const centers = await Center.find({
            centerName: { $regex: name, $options: 'i' }
        }).sort({ centerCode: 1 });
        res.json(centers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new center
export const createCenter = async (req, res) => {
    try {
        const { centerCode, centerName, state, city, latitude, longitude, address, media, biometricDeskCount, remark } = req.body;
        console.log('Received data:', { centerCode, centerName, state, city, latitude, longitude, address, biometricDeskCount });

        // Get user email from token
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ message: 'User email not found in token' });
        }

        // Check if user has already submitted today
        const today = moment().startOf('day');
        const tomorrow = moment(today).add(1, 'day');

        const existingSubmission = await UserSubmission.findOne({
            submittedBy: userEmail,
            submittedAt: {
                $gte: today.toDate(),
                $lt: tomorrow.toDate()
            }
        });

        if (existingSubmission) {
            return res.status(400).json({
                message: 'You have already submitted a form today. Please edit your existing submission instead.'
            });
        }

        const centerData = {
            centerCode,
            centerName,
            state,
            city,
            submittedBy: userEmail
        };

        // Add location data if provided
        if (latitude && longitude) {
            centerData.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address: address || ''
            };
        }

        // Add biometric desk count if provided
        if (biometricDeskCount) {
            centerData.biometricDeskCount = biometricDeskCount;
        }

        // Add remark if provided
        if (remark) {
            centerData.remark = remark;
        }

        // Add media data organized by category if provided
        if (media) {
            const processedMedia = {};

            // Process each media category
            for (const [category, mediaItems] of Object.entries(media)) {
                if (Array.isArray(mediaItems)) {
                    processedMedia[category] = mediaItems.map(item => ({
                        url: item.url || item.uri,
                        publicId: item.publicId || '',
                        type: item.type || 'image',
                        originalName: item.name || item.originalName || 'unnamed',
                        ...(item.location && {
                            location: {
                                type: 'Point',
                                coordinates: [
                                    parseFloat(item.location.longitude),
                                    parseFloat(item.location.latitude)
                                ]
                            }
                        }),
                        address: item.address || ''
                    }));
                }
            }

            centerData.media = processedMedia;
        }

        // Create a user submission record (this will be the primary storage)
        console.log('Location data from request:', { latitude, longitude, address, remark });

        // Extract location from media if main location is missing
        let finalLatitude = latitude;
        let finalLongitude = longitude;
        let finalAddress = address;

        // If main location is missing, try to get from media files
        if ((!finalLatitude || !finalLongitude) && media) {
            // Look for location in any media category
            const mediaCategories = ['entry', 'passage', 'biometricDeskSetup', 'biometricDeskCount', 'entryToPassage'];

            for (const category of mediaCategories) {
                if (media[category] && media[category].length > 0) {
                    const firstMediaWithLocation = media[category].find(item =>
                        item.location && item.location.latitude && item.location.longitude
                    );

                    if (firstMediaWithLocation) {
                        finalLatitude = firstMediaWithLocation.location.latitude;
                        finalLongitude = firstMediaWithLocation.location.longitude;
                        finalAddress = firstMediaWithLocation.address || finalAddress;
                        console.log('Using location from media:', { finalLatitude, finalLongitude, finalAddress });
                        break;
                    }
                }
            }
        }

        const userSubmissionData = {
            submittedBy: userEmail,
            centerData: {
                centerCode,
                centerName,
                state,
                city,
                ...(finalLatitude && finalLongitude && {
                    location: {
                        type: 'Point',
                        coordinates: [
                            typeof finalLongitude === 'number' ? finalLongitude : parseFloat(finalLongitude),
                            typeof finalLatitude === 'number' ? finalLatitude : parseFloat(finalLatitude)
                        ],
                        address: finalAddress || ''
                    }
                }),
                biometricDeskCount,
                remark,
                media
            }
        };

        console.log('Final userSubmissionData:', JSON.stringify(userSubmissionData, null, 2));

        const userSubmission = new UserSubmission(userSubmissionData);

        const savedSubmission = await userSubmission.save();

        // Also save to the main Center collection for state/city lookup
        const centerForLookup = {
            centerCode,
            centerName,
            state,
            city,
            submittedBy: userEmail
        };

        await Center.updateOne(
            { centerCode: centerCode },
            { ...centerForLookup },
            { upsert: true } // Create if doesn't exist, update if exists
        );

        res.status(201).json(savedSubmission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Bulk create centers from CSV
export const createCentersBulk = async (req, res) => {
    try {
        const centers = req.body;

        // Get user email from token
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ message: 'User email not found in token' });
        }

        // Validate data
        for (const center of centers) {
            if (!center.centerCode || !center.centerName || !center.state || !center.city) {
                return res.status(400).json({ message: 'Missing required fields in center data' });
            }
        }

        // Create user submission records (this will be the primary storage)
        const userSubmissions = centers.map(center => ({
            submittedBy: userEmail,
            centerData: {
                centerCode: center.centerCode,
                centerName: center.centerName,
                state: center.state,
                city: center.city,
                location: center.location,
                biometricDeskCount: center.biometricDeskCount,
                media: center.media
            }
        }));

        const savedSubmissions = await UserSubmission.insertMany(userSubmissions);

        // Also save to the main Center collection for state/city lookup
        const centersForLookup = centers.map(center => ({
            centerCode: center.centerCode,
            centerName: center.centerName,
            state: center.state,
            city: center.city,
            submittedBy: userEmail
        }));

        // Insert or update centers in the main collection
        for (const center of centersForLookup) {
            await Center.updateOne(
                { centerCode: center.centerCode },
                { ...center },
                { upsert: true } // Create if doesn't exist, update if exists
            );
        }

        res.status(201).json(savedSubmissions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};