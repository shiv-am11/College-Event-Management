const ImageKit = require("@imagekit/nodejs");

function getImageKitClient() {
    const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
        throw new Error(
            "Missing ImageKit environment variables. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT."
        );
    }

    return new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    });
}

async function uploadFile(file) {
    try {
        const imageKit = getImageKitClient();
        const result = await imageKit.files.upload({
            file: file.buffer.toString("base64"),
            fileName: Date.now() + "-" + file.originalname,
            folder: "/events",
        });
        return result.url;
    } catch (err) {
        console.error("Image Upload Failed:", err);
        throw err;
    }
}

module.exports = uploadFile;
