import multer from "multer";
import path from "path";

const multerStorage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  let ext = path.extname(file.originalname);
  if (![".jpg", ".jpeg", ".png"].includes(ext)) {
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
