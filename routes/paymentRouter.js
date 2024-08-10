const express = require("express")
const router = express.Router()
const { newPayment, checkStatus, helper } = require("../controller/phonePeController")

router.post('/indirect-payment', helper)
router.post('/status/:txnId', checkStatus);
router.post('/payment', newPayment);

module.exports = router



