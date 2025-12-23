import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    url: String,
    publicId: String,
    type: String, // 'image' or 'video'
    originalName: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
    },
    address: String
});

const centerSchema = new mongoose.Schema({
    centerCode: {
        type: String,
        required: true,
        unique: true
    },
    centerName: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    location: locationSchema,
    media: [mediaSchema]
}, {
    timestamps: true
});

export default mongoose.model('Center', centerSchema);