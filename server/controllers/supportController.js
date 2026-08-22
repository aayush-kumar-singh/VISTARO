const ContactSubmission = require("../models/ContactSubmission.js");
const { sendContactNotification } = require("../utils/sendEmail.js");

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const ALLOWED_CATEGORIES = ["General", "Booking Issue", "Account", "Feedback", "Other"];

// --------------------------------------------------
// Submit public support contact inquiry
// POST /api/support/contact
// --------------------------------------------------
module.exports.submitContactForm = async (req, res) => {
    const rawData = req.body.contact || req.body;
    let { name, email, subject, category, message } = rawData;

    // 1. Sanitize & trim inputs
    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    subject = (subject || "").trim();
    category = (category || "General").trim();
    message = (message || "").trim();

    // 2. Validate required fields
    if (!name || name.length < 2) {
        return res.status(400).json({
            success: false,
            error: "Please provide a valid name (at least 2 characters).",
        });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({
            success: false,
            error: "Please provide a valid email address.",
        });
    }

    if (!subject || subject.length < 3) {
        return res.status(400).json({
            success: false,
            error: "Please provide a descriptive subject (at least 3 characters).",
        });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
        category = "General";
    }

    if (!message || message.length < 10) {
        return res.status(400).json({
            success: false,
            error: "Please provide a detailed message (at least 10 characters).",
        });
    }

    // 3. Create Contact Submission record
    const submission = new ContactSubmission({
        name,
        email,
        subject,
        category,
        message,
        status: "New",
        user: req.user ? req.user._id : null,
    });

    await submission.save();

    // 4. Send email notification asynchronously
    sendContactNotification({ submission }).catch((err) => {
        console.error("[Support] Notification dispatch error:", err);
    });

    const referenceNumber = submission._id.toString().slice(-8).toUpperCase();

    res.status(201).json({
        success: true,
        message: "Thank you for contacting Vistaro. Your inquiry has been received and our team will get back to you shortly.",
        referenceNumber,
        submissionId: submission._id,
    });
};
