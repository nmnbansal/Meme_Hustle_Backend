const express = require('express');
const { placeBid, getBids } = require('../controllers/bidController');
const { mockAuth } = require('../middleware/auth');
const router = express.Router();

router.use(mockAuth);

router.post('/:meme_id/bid', placeBid);
router.get('/:meme_id/bids', getBids);

module.exports = router;