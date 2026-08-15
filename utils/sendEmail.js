const nodemailer = require("nodemailer");

// Create reusable transporter
let transporter;

async function getTransporter() {
    if (transporter) return transporter;

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10) || 587,
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Fallback test transporter for local development
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        } catch (e) {
            // In case ethereal is unreachable offline, fallback to json transport
            transporter = nodemailer.createTransport({
                jsonTransport: true,
            });
        }
    }
    return transporter;
}

module.exports.sendBookingConfirmation = async ({ user, listing, booking }) => {
    try {
        const mailer = await getTransporter();

        const checkInStr = new Date(booking.checkIn).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const checkOutStr = new Date(booking.checkOut).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        const basePrice = (booking.nights * listing.price).toLocaleString("en-IN");
        const gst = Math.round(booking.nights * listing.price * 0.18).toLocaleString("en-IN");
        const total = booking.totalPrice.toLocaleString("en-IN");

        const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #ff385c; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="color: #dc3545; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Vis<span style="color: #1a1a2e;">taro</span></h1>
                <p style="color: #666; margin: 4px 0 0 0; font-size: 14px;">Reservation Confirmed</p>
            </div>

            <p style="font-size: 16px; color: #333;">Hi <strong>${user.username}</strong>,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.5;">Your reservation at <strong>${listing.title}</strong> is officially confirmed! Here is your complete booking receipt.</p>

            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #222; font-size: 18px; border-bottom: 1px solid #e9ecef; padding-bottom: 8px;">Trip Details</h3>
                <table style="width: 100%; font-size: 14px; color: #444; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0;"><strong>Property:</strong></td>
                        <td style="padding: 6px 0; text-align: right;">${listing.title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Location:</strong></td>
                        <td style="padding: 6px 0; text-align: right;">${listing.location}, ${listing.country}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Dates:</strong></td>
                        <td style="padding: 6px 0; text-align: right;">${checkInStr} &ndash; ${checkOutStr}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Duration:</strong></td>
                        <td style="padding: 6px 0; text-align: right;">${booking.nights} night(s)</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Guests:</strong></td>
                        <td style="padding: 6px 0; text-align: right;">${booking.guests || 1} guest(s)</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Confirmation Code:</strong></td>
                        <td style="padding: 6px 0; text-align: right;"><code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${booking._id}</code></td>
                    </tr>
                </table>
            </div>

            <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #222; font-size: 18px; border-bottom: 1px solid #e9ecef; padding-bottom: 8px;">Price Breakdown</h3>
                <table style="width: 100%; font-size: 14px; color: #444; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0;">&#8377; ${listing.price.toLocaleString("en-IN")} &times; ${booking.nights} nights</td>
                        <td style="padding: 6px 0; text-align: right;">&#8377; ${basePrice}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;">GST (18%)</td>
                        <td style="padding: 6px 0; text-align: right;">&#8377; ${gst}</td>
                    </tr>
                    <tr style="border-top: 1px solid #ddd; font-weight: bold; font-size: 16px; color: #222;">
                        <td style="padding: 10px 0 4px 0;">Total Paid:</td>
                        <td style="padding: 10px 0 4px 0; text-align: right; color: #ff385c;">&#8377; ${total}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
                <p style="margin: 4px 0;">Need to manage or cancel your trip? Visit your <a href="${process.env.APP_URL || 'http://localhost:3003'}/profile" style="color: #ff385c; text-decoration: none;">Account Profile</a>.</p>
                <p style="margin: 4px 0;">&copy; ${new Date().getFullYear()} Vistaro, Inc.</p>
            </div>
        </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Vistaro" <no-reply@vistaro.com>',
            to: user.email,
            subject: `Reservation Confirmed: ${listing.title}`,
            text: `Hi ${user.username}, your booking for ${listing.title} from ${checkInStr} to ${checkOutStr} is confirmed! Total: Rs. ${total}`,
            html: htmlContent,
        };

        const info = await mailer.sendMail(mailOptions);
        console.log("Booking confirmation email sent:", info.messageId || "logged");
        if (nodemailer.getTestMessageUrl(info)) {
            console.log("Ethereal Email Preview URL:", nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (err) {
        console.error("Failed to send booking confirmation email:", err);
    }
};

module.exports.sendCancellationConfirmation = async ({ user, listing, booking, refundAmount, refundPercentage, reason }) => {
    try {
        const mailer = await getTransporter();

        const checkInStr = new Date(booking.checkIn).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const checkOutStr = new Date(booking.checkOut).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #dc3545; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="color: #dc3545; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Vis<span style="color: #1a1a2e;">taro</span></h1>
                <p style="color: #666; margin: 4px 0 0 0; font-size: 14px;">Reservation Cancelled</p>
            </div>

            <p style="font-size: 16px; color: #333;">Hi <strong>${user.username}</strong>,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.5;">Your reservation at <strong>${listing.title}</strong> has been cancelled. Below is the confirmation of your cancellation and refund details.</p>

            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #222; font-size: 18px; border-bottom: 1px solid #e9ecef; padding-bottom: 8px;">Cancellation Summary</h3>
                <table style="width: 100%; font-size: 14px; color: #444; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0;"><strong>Property:</strong></td>
                        <td style="padding: 6px 0; text-align: right;">${listing.title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Dates:</strong></td>
                        <td style="padding: 6px 0; text-align: right;">${checkInStr} &ndash; ${checkOutStr}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Policy Applied:</strong></td>
                        <td style="padding: 6px 0; text-align: right; text-transform: capitalize;">${booking.policySnapshot || 'flexible'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Refund Percentage:</strong></td>
                        <td style="padding: 6px 0; text-align: right; font-weight: bold; color: ${refundPercentage > 0 ? '#28a745' : '#dc3545'};">${refundPercentage}%</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Refund Amount:</strong></td>
                        <td style="padding: 6px 0; text-align: right; font-weight: bold; font-size: 16px; color: #28a745;">&#8377; ${refundAmount.toLocaleString('en-IN')}</td>
                    </tr>
                    ${reason ? `<tr><td style="padding: 6px 0;"><strong>Reason:</strong></td><td style="padding: 6px 0; text-align: right;">${reason}</td></tr>` : ''}
                </table>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
                <p style="margin: 4px 0;">Refunds are processed to your original payment method within 3&ndash;5 business days.</p>
                <p style="margin: 4px 0;">&copy; ${new Date().getFullYear()} Vistaro, Inc.</p>
            </div>
        </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Vistaro" <no-reply@vistaro.com>',
            to: user.email,
            subject: `Reservation Cancelled: ${listing.title}`,
            text: `Hi ${user.username}, your booking for ${listing.title} has been cancelled. Refund: ${refundPercentage}% (Rs. ${refundAmount}).`,
            html: htmlContent,
        };

        const info = await mailer.sendMail(mailOptions);
        console.log("Cancellation confirmation email sent:", info.messageId || "logged");
        return info;
    } catch (err) {
        console.error("Failed to send cancellation email:", err);
    }
};
