const crypto = require("crypto");
const axios = require("axios");
const Transaction = require("../model/transactionModel");

let userId = "";

const helper = async (req, res) => {
  try {
    const response = await axios.post(
      `https://gptsahib-server-1050062966711.us-central1.run.app/api/payment/payment`,
      {
        amount: req.body.amount,
        MUID: `MUID${Date.now()}`,
        transactionId: `T${Date.now()}`,
        userId: req.body.userId,
      }
    );
    userId = req.body.userId;
    return res.status(200).json({ data: response.data });
  } catch (error) {
    console.log(error, 123);

    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const newPayment = async (req, res) => {
  try {
    const merchantTransactionId = req.res.req.body.transactionId;
    const data = {
      merchantId: "PGTESTPAYUAT86", //change it to original one
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.res.req.body.MUID,
      amount: req.res.req.body.amount * 100,
      userId: req.res.req.body.userId,
      redirectUrl: `https://gptsahib-server-1050062966711.us-central1.run.app/api/payment/status/${merchantTransactionId}`,
      callbackUrl: `https://gptsahib-server-1050062966711.us-central1.run.app/api/payment/status/${merchantTransactionId}`,
      redirectMode: "POST",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string =
      payloadMain + "/pg/v1/pay" + "96434309-7796-489d-8924-ab56988a6076";
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;
    const options = {
      method: "POST",
      url: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay", //change it to original one
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
      payload: {
        request: req.res.req.body,
      },
    };
    axios
      .request(options)
      .then(function (response) {
        return res.json(response.data.data.instrumentResponse.redirectInfo.url);
      })
      .catch(function (error) {
        console.error(error.response.data);
      });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

const checkStatus = async (req, res) => {
  const merchantTransactionId = res.req.body.transactionId;
  const merchantId = res.req.body.merchantId;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    "96434309-7796-489d-8924-ab56988a6076";
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`, //change it to original one
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {

        await Transaction.create({
          merchantId: response.data.data.merchantId,
          merchantTransactionId: response.data.data.merchantTransactionId,
          transactionId: response.data.data.transactionId,
          amount: response.data.data.amount / 100,
          state: response.data.data.state,
          responseCode: response.data.data.responseCode,
          paymentInstrument: response.data.data.paymentInstrument,
          userId: userId,
        });
        const url = `https://gptsahib.com/success?transactionId=${response.data.data.transactionId}`;
        return res.redirect(url);
      } else {
        const url = "https://gptsahib.com/failure";
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  newPayment,
  checkStatus,
  helper,
};
