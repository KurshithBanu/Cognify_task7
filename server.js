require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 
});

app.use(limiter);
app.use(express.static('public'));

// GitHub OAuth - Redirect to GitHub for authentication
app.get('/auth/github', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}`);
});

// GitHub OAuth - Handle callback and exchange code for access token
app.get('/auth/github/callback', async (req, res) => {
    try {
        const code = req.query.code;
        const tokenResponse = await axios.post(
            `https://github.com/login/oauth/access_token`,
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            },
            { headers: { Accept: 'application/json' } }
        );

        const token = tokenResponse.data.access_token;
        // Redirect with token for client-side storage
        res.redirect(`/?token=${token}`);
    } catch (error) {
        console.error('Error during GitHub OAuth callback:', error);
        res.status(500).send('Authentication failed');
    }
});

// Fetch user repositories using the access token 
app.get('/api/repos', async (req, res) => {
    try {
        const token = req.query.token || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

        const repoResponse = await axios.get(
            `https://api.github.com/user/repos`,
            { headers: { Authorization: `token ${token}` } }
        );
        res.json(repoResponse.data);
    } catch (error) {
        console.error('Error fetching repositories:', error);
        res.status(500).send('Failed to fetch repositories');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
