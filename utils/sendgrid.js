import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // 🔐 API Key

export const sendWelcomeEmail = async (to, username) => {
  const msg = {
    to,
    from: 'marta.pino@outlook.com', 
    subject: '🎉 Welcome to Bloomio!',
    html: `
      <div style="
        font-family: 'Poppins', sans-serif;
        background-color: #ffffff;
        color: #2a2a2a;
        padding: 2rem;
        border-radius: 12px;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      ">
        <h1 style="color: #f2e1c1; margin-bottom: 0.5rem;">👋 Hi ${username},</h1>
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">
          Welcome to Bloomio—where your creativity blooms!
        </p>
        <p style="margin-bottom: 1rem;">
          Here's what you can do on Bloomio:
        </p>
        <ul style="padding-left: 1.2rem; margin-bottom: 1.5rem; color: #4a4a4a;">
          <li>📂 Publish your visual projects</li>
          <li>🎨 Build unique moodboards</li>
          <li>🌈 Generate a personalized color palette</li>
        </ul>
        <p style="margin-bottom: 2rem;">
          We can’t wait to see what you create! 💫
        </p>
        <hr style="border: 1px solid #fafafa; margin-bottom: 1.5rem;" />
        <p style="font-size: 0.9rem; color: #7a7a7a;">
          Need help? Reply to this email anytime.<br/>
          — The Bloomio Team
        </p>
      </div>
    `,
  };

  await sgMail.send(msg);
};
 