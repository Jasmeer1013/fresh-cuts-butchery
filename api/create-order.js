import Razorpay from "razorpay";

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { amount, keyId, keySecret } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  // Fallback to env variables if not supplied explicitly from dashboard settings
  const rzpKeyId = keyId || process.env.RAZORPAY_KEY_ID;
  const rzpKeySecret = keySecret || process.env.RAZORPAY_KEY_SECRET;

  if (!rzpKeyId) {
    return res.status(400).json({ error: "Razorpay Merchant Key ID is missing" });
  }

  // If no Secret is provided (client-only mock test mode), return null order ID
  if (!rzpKeySecret) {
    return res.status(200).json({
      orderId: null,
      message: "Running in client-only test mode (No Secret Key configured)"
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpKeySecret
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount), // must be in currency subunits (paise for INR)
      currency: "INR",
      receipt: "fc_rcpt_" + Math.floor(Math.random() * 1000000)
    });

    return res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.error("Razorpay order creation error details:", error);
    return res.status(500).json({
      error: error.description || error.message || "Failed to create order on Razorpay"
    });
  }
}
