const multer = require("multer")


exports.uploadFile = (imageSong, fileSong) => {
    // make destination file for upload
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads")
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""))
        }
    })

    // file filter based on extension file
    const fileFilter = function (req, file, cb) {
        if (file.fieldname === imageSong) {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
                req.fileValidationError = {
                    message: "Only image files are allowed"
                }
                return cb(new Error("Only image files are allowed"), false)
            }
        }
        if (file.fieldname === fileSong) {
            if (!file.originalname.match(/\.(mp3)$/)) {
                req.fileValidationError = {
                    message: "Only audio files are allowed!",
                };
                return cb(new Error("Only audio files are allowed!"), false);
            }
        }
        cb(null, true)
    }

    const sizeInMB = 80
    const maxSize = sizeInMB * 1000 * 1000

    // Generate setting multer
    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize
        }
    }).fields([
        {
            name: imageSong,
            maxCount: 1,
        },
        {
            name: fileSong,
            maxCount: 1,
        },
    ])

    // middleware handler
    return (req, res, next) => {
        upload(req, res, function (err) {
            // show an error if validation error
            if (req.fileValidationError)
                return res.status(400).send(req.fileValidationError)

            // show an error if it bigger than max size
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).send({
                        message: "Max file size 80MB"
                    })
                }
                return res.status(400).send(err)
            }

            // if okay next to controller
            return next()
        })
    }
};