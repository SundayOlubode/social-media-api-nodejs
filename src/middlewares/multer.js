import multer from "multer";

const multerStorage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})


const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    }
    else {
        cb({ message: 'Unsupported file format' }, false)
    }
}


const multerUpload = multer({
    storage: multerStorage,
    fileFilter: fileFilter
})


export default multerUpload;