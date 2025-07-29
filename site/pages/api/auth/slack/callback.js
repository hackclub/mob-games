export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Authorization code is required' });
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: code,
        redirect_uri: 'https://mob-games.hackclub.dev/api/auth/slack/callback',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack OAuth error:', tokenData);
      return res.status(400).json({ message: 'Failed to authenticate with Slack' });
    }

    // Get user info using the new API
    const userResponse = await fetch('https://slack.com/api/users.profile.get', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.ok) {
      console.error('Slack user info error:', userData);
      return res.status(400).json({ message: 'Failed to get user info from Slack' });
    }

    // Store user info in session or database here if needed
    // For now, just redirect to the app page
    res.redirect('/app');

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 