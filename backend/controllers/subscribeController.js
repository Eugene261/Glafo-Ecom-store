const Subscribe = require('../models/subscribe.js');

// @route POST /api/subscribe
// @desc Handle newsletter subscription
// @access Public
const handleSubscribe = async(req, res) => {
    const {email} = req.body;

    if(!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Check if the email is already subscribed
        const existingSubscriber = await Subscribe.findOne({ email });

        if (existingSubscriber) {
            return res.status(400).json({ 
                success: false,
                message: "Email is already subscribed" 
            });
        }

        // Create a new subscriber using the Subscribe model
        const newSubscriber = new Subscribe({ email });
        await newSubscriber.save();

        return res.status(201).json({
            success: true,
            message: "Successfully subscribed to the newsletter",
            data: newSubscriber
        });

    } catch (error) {
        console.error("Subscription error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

module.exports = { handleSubscribe };