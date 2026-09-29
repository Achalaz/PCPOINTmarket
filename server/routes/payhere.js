import express from 'express';
import crypto from 'crypto';

const router = express.Router();

/**
 * POST /api/payhere/hash
 * Generates a secure MD5 hash for PayHere payment initiation.
 * The Merchant Secret NEVER leaves the server.
 *
 * Required body: { order_id, amount, currency }
 */
router.post('/hash', (req, res) => {
  const { order_id, amount, currency } = req.body;

  if (!order_id || !amount || !currency) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: order_id, amount, currency',
    });
  }

  const merchantId     = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchantId || !merchantSecret) {
    return res.status(500).json({
      success: false,
      message: 'PayHere credentials not configured on server.',
    });
  }

  // PayHere hash formula:
  // MD5( merchant_id + order_id + amount_formatted + currency + MD5(merchant_secret).toUpperCase() ).toUpperCase()
  const amountFormatted = parseFloat(amount).toFixed(2);

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const rawHash = `${merchantId}${order_id}${amountFormatted}${currency}${hashedSecret}`;

  const hash = crypto
    .createHash('md5')
    .update(rawHash)
    .digest('hex')
    .toUpperCase();

  return res.json({
    success: true,
    hash,
    merchant_id: merchantId,
    sandbox: process.env.PAYHERE_SANDBOX === 'true',
  });
});

/**
 * POST /api/payhere/notify
 * PayHere server-to-server payment notification (webhook).
 * Called by PayHere after a successful transaction.
 */
router.post('/notify', express.urlencoded({ extended: true }), (req, res) => {
  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  // Verify the signature from PayHere
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const expectedSig = crypto
    .createHash('md5')
    .update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`)
    .digest('hex')
    .toUpperCase();

  if (md5sig !== expectedSig) {
    console.warn(`[PayHere Notify] INVALID signature for order ${order_id}`);
    return res.status(400).send('Invalid signature');
  }

  // status_code 2 = payment success
  if (status_code === '2') {
    console.log(`[PayHere Notify] ✅ Payment SUCCESS — Order: ${order_id} | PayHere ID: ${payment_id} | Amount: ${payhere_currency} ${payhere_amount}`);
    // TODO: update order status in DB here if you add an orders collection
  } else {
    console.log(`[PayHere Notify] ⚠️ Payment status ${status_code} for order ${order_id}`);
  }

  res.sendStatus(200);
});

export default router;
