const cloudinary = require('cloudinary').v2;
const chalk = require('chalk').default || require('chalk');
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL
    });
}

/**
 * Uploads a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Optional folder name
 * @returns {Promise<string>} - Cloudinary URL
 */
const uploadToCloudinary = (buffer, folder = 'sundorjo-ai') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(' Cloudinary Upload Error: ') + chalk.yellow(error.message));
                    return reject(error);
                }
                console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Image uploaded successfully to Cloudinary: ') + chalk.cyan(result.secure_url));
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};

module.exports = {
    uploadToCloudinary,
    cloudinary
};
