const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /jpeg|png/;
    const allowedMimeTypes = /image\/jpeg|image\/png/;

    let extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    let mimeType = allowedMimeTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        let err = new Error('Invalid file format. Only JPEG and PNG are allowed.');
        err.statusCode = 400;
        err.isOperational = true;
        err.isMulter = true;
        return cb(err);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload
