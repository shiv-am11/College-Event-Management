const ImageKit = require('@imagekit/nodejs');

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})
async function uploadFile(file){
    try{
        const result = await imageKit.files.upload({
            file : file.buffer.toString("base64"),
            fileName: Date.now() + "-" + file.originalname,
            folder: "/events",
        });
        return result.url;
    }catch(err){
       console.error("Image Upload Failed:" , err)
       throw err;
    }
}module.exports= uploadFile;