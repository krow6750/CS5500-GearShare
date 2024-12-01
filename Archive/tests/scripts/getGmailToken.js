import { google } from 'googleapis';
import dotenv from 'dotenv';
import open from 'open';
import express from 'express';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3005;

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  `http://localhost:${PORT}/setup-gmail`
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
  prompt: 'consent'
});

app.get('/setup-gmail', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error('No authorization code received');
    }

    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      throw new Error('No refresh token received. Please revoke app access in Google Account settings and try again.');
    }

    console.log('\n✅ Add this refresh token to your .env file:');
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    
    res.send('Success! Check your console for the refresh token.');
    
    // Close server after success
    setTimeout(() => {
      process.exit(0);
    }, 1000);

  } catch (error) {
    console.error('Error getting token:', error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server started on port ${PORT}`);
  console.log('Opening Google Auth page...');
  open(authUrl).catch(console.error);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.log('Please:');
    console.log('1. Check if the server is already running');
    console.log('2. Close the server and try again');
  }
}); 