const path = require("path");
const pathDir = require("../utils/path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(pathDir, "public", "images"));
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedType = ["image/jpg", "image/png", "image/jpeg"];
  if (allowedType.includes(file.mimetype)) return cb(null, true);
  return cb(null, false);
};

module.exports = multer({ storage, fileFilter }).single("image");
