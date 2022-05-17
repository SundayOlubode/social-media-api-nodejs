import multer from "multer";
import path from "path";

const multerStorage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const whiteListMediaTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "video/mp4",
];

const fileFilter = (req, file, cb) => {
  if (!whiteListMediaTypes.includes(file.mimetype)) {
    cb({ message: "Unsupported file format" }, false);
    return;
  }
  cb(null, true);
};

const multerUpload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
});

export default multerUpload;
