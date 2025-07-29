export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Authorization code is required' });
  }

  try {
    // Determine the redirect URI based on the request
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const redirectUri = `${protocol}://${host}/api/auth/slack/callback`;

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
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack OAuth error:', tokenData);
      return res.status(400).json({ message: 'Failed to authenticate with Slack' });
    }

    // Get user info using the users.info API
    const userResponse = await fetch('https://slack.com/api/users.info', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      body: new URLSearchParams({
        user: tokenData.authed_user?.id || 'me'
      }),
    });

    const userData = await userResponse.json();

    if (!userData.ok) {
      console.error('Slack user info error:', userData);
      return res.status(400).json({ message: 'Failed to get user info from Slack' });
    }

    // Store session data with user info
    const sessionData = {
      slackId: userData.user.id,
      accessToken: tokenData.access_token
    };

    // Set a cookie with session data
    res.setHeader('Set-Cookie', [
      `userData=${JSON.stringify(sessionData)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
    ]);

    // Redirect to the app page
    res.redirect('/app');

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 