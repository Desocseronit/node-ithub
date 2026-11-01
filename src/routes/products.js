const express = require('express');
const router = express.Router();
const {validateRequest , schemas} = require("./../middleware/validate")

router.get('/', (req, res, next) => {
    res.send('sap')
});

module.exports = router;
