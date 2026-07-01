// services/storage.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

let serviceAccount;

// Check if we are in production (DigitalOcean) or local development
if (process.env.FIREBASE_PRIVATE_KEY) {
    // We are in production: use the individual env variables
    serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace literal string "\n" with actual line breaks for the key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
} else {
    // We are local: use the physical JSON file
    serviceAccount = require('../config/minesec-awards-storage-firebase-adminsdk-fbsvc-35133f7077.json');
}

// 1. Initialize Firebase using the modular functions
initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'minesec-awards-storage.firebasestorage.app'
});

// 2. Get the storage bucket using the modular function
const bucket = getStorage().bucket();

/**
 * Uploads a file buffer to Firebase Storage and returns the public URL.
 * @param {Object} file - The file object from multer (req.file)
 * @param {String} folder - The folder path in the bucket (e.g., 'sponsors', 'applications')
 * @returns {Promise<String>} - The public download URL
 */
exports.uploadFile = async (file, folder) => {
    if (!file) return null;

    // Create a unique filename
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const destination = `${folder}/${uniqueName}`;
    const fileRef = bucket.file(destination);

    // Upload the buffer from multer memory storage
    await fileRef.save(file.buffer, {
        metadata: {
            contentType: file.mimetype,
        },
    });

    // Make the file publicly accessible
    await fileRef.makePublic();

    // Return the public URL formatted for Firebase Storage
    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
};