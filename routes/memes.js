const express = require('express');
const { createMeme, voteMeme, getLeaderboard, getMemes } = require('../controllers/memeController');
const { mockAuth } = require('../middleware/auth');
const router = express.Router();

router.use(mockAuth);

router.post('/', createMeme);
router.post('/:id/vote', voteMeme);
router.get('/leaderboard', getLeaderboard);
router.get('/', getMemes);

module.exports = router;