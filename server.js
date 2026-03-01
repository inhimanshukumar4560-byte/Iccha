const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Yeh line ensure karti hai ki Render ke variables load ho jayein

// Express app setup
const app = express();

// --- START: FINAL CORS CONFIGURATION ---
// Whitelist: Sirf in websites ko allow karein
const allowedOrigins = [
  'https://shubhzone.shop', // Aapka live domain
  'http://shubhzone.shop',  // Non-https version bhi add kar dein
  'http://localhost:3000'   // Agar aap future mein computer par test karein
];

const corsOptions = {
  origin: function (origin, callback) {
    // Agar request in websites se aa rahi hai, toh allow karo
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      // Agar kisi aur website se request aa rahi hai, toh block karo
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // For older browsers
};

// CORS ko enable karein
app.use(cors(corsOptions));
// --- END: FINAL CORS CONFIGURATION ---

// JSON data read karne ke liye middleware
app.use(express.json());

// Aapki HTML, CSS, JS, images (Frontend) ko serve karne ke liye
app.use(express.static(path.join(__dirname)));

// Default route - Jab koi website kholega toh usko index.html dikhega
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Razorpay API Route - Naya Order create karne ke liye
app.post('/create-order', async (req, res) => {
    try {
        // Frontend (index.html) se amount aayega (Rupees mein)
        const { amount } = req.body;

        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        
        if (!key_id || !key_secret) {
            console.error("Razorpay keys are not loaded from environment variables!");
            return res.status(500).json({ error: "API keys are missing on the server." });
        }

        // Razorpay ka setup
        const razorpay = new Razorpay({
            key_id: key_id,
            key_secret: key_secret
        });

        // Order ki details
        const options = {
            amount: amount * 100, // Razorpay amount ko humesha Paise mein leta hai (₹1 = 100 paise)
            currency: "INR",
            receipt: "receipt_" + Date.now(), // Har order ka ek unique receipt number
        };

        // Razorpay ke server se secure order_id create karwana
        console.log("Creating Razorpay order with amount:", options.amount);
        const order = await razorpay.orders.create(options);
        console.log("Razorpay order created successfully:", order);

        // Frontend ko order details waapas bhejna
        res.status(200).json(order);
    } catch (err) {
        console.error("Order Creation Error:", err);
        res.status(500).json({ error: "Backend mein kuch problem aayi!" });
    }
});

// Server Start karna
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
