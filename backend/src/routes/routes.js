const express = require('express');
const router = express.Router();

router.use('/blackjack', require('./blackjack'));
router.use('/three-card-poker', require('./threeCardPoker'));

module.exports = router;