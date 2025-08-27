const express = require('express');
const router = express.Router();
const {
    deleteMedia,
    updateUserPicture,
    saveUploadInfo,
    uploadImage,
    uploadVideo
} = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.post("/image", authenticate(["user", "admin"]), upload.single("file"), uploadImage);
router.post("/video", authenticate(["admin"]), upload.single("file"), uploadVideo);
router.post("/save", authenticate(["user", "admin"]), saveUploadInfo);
router.patch('/picture', authenticate(["user"]), upload.single('file'), updateUserPicture);
router.delete('/media', authenticate(["user", "admin"]), deleteMedia);

module.exports = router;
