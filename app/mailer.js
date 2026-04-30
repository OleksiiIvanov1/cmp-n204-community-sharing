// app/mailer.js
// Email helper using nodemailer + Ethereal (test inbox)
// Logs a preview URL to the console for every email sent.

const nodemailer = require("nodemailer");

let transporter = null;
let testAccount = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Create a fresh Ethereal test account on first use
    testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    console.log("📧 Ethereal test account created:", testAccount.user);
    return transporter;
}

async function sendMail({ to, subject, text, html }) {
    try {
        const t = await getTransporter();
        const info = await t.sendMail({
            from: '"Community Share" <noreply@communityshare.test>',
            to,
            subject,
            text,
            html: html || `<p>${text}</p>`
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("📧 Email sent to:", to);
        console.log("📧 Subject:", subject);
        console.log("📧 Preview URL:", previewUrl);

        return { success: true, previewUrl };
    } catch (err) {
        // Never let an email failure break the user's request
        console.error("📧 Email failed (non-fatal):", err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { sendMail };