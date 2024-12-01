import { google } from 'googleapis';
import open from 'open';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3005;

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  `http://localhost:${PORT}/oauth2callback`
);

// Generate the URL for Gmail authorization
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
  prompt: 'consent'
});

app.get('/oauth2callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ Add these tokens to your .env file:');
    console.log(`GMAIL_ACCESS_TOKEN=${tokens.access_token}`);
    if (tokens.refresh_token) {
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    }
    
    res.send('Success! Check your terminal for the tokens.');
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).send('Error getting tokens');
  }
});

// Start server and open auth URL
app.listen(PORT, () => {
  console.log(`\n🚀 Server started on port ${PORT}`);
  console.log('Opening Google authorization page...');
  open(authUrl);
}); 