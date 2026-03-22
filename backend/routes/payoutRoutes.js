const express = require('express');
const router = express.Router();
const { saveUpi, getUpi, requestPayout, getMyPayouts } = require('../controllers/payoutController');
const { auth } = require('../middleware/authMiddleware');

router.put('/upi', auth, saveUpi);
router.get('/upi', auth, getUpi);
router.post('/request', auth, requestPayout);
router.get('/myrequests', auth, getMyPayouts);

module.exports = router;
