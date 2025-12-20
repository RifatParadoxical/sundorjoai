const axios = require('axios');
const FormData = require('form-data');


async function uploadToTmpFiles(file) {
    if (!file) return "https://tmpfiles.org/dl/16234318/syntexcore.png";

    try {
        console.log('Uploading image to tmpfiles.org...');
        const formData = new FormData();
        formData.append('file', file.buffer, file.originalname);

        const uploadRes = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        if (uploadRes.data && uploadRes.data.data && uploadRes.data.data.url) {

            const downloadUrl = uploadRes.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            console.log('Image uploaded successfully:', downloadUrl);
            return downloadUrl;
        }
    } catch (error) {
        console.error('Error uploading to tmpfiles.org:', error.message);
    }



    return "https://tmpfiles.org/dl/16234318/syntexcore.png";
}


module.exports = {
    uploadToTmpFiles
};
