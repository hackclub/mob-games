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

    // Get user info using the identity API (for user tokens) or users.info (for bot tokens)
    let userData;
    
    if (tokenData.authed_user) {
      // User token - we have user info directly
      userData = {
        ok: true,
        user: {
          id: tokenData.authed_user.id,
          name: tokenData.authed_user.name,
          real_name: tokenData.authed_user.real_name
        },
        profile: {
          real_name: tokenData.authed_user.real_name,
          display_name: tokenData.authed_user.name,
          image_192: tokenData.authed_user.image_192,
          image_72: tokenData.authed_user.image_72
        }
      };
    } else {
      // Bot token - we need to get user info differently
      // For now, let's use the identity API
      const userResponse = await fetch('https://slack.com/api/users.identity', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      userData = await userResponse.json();
    }

    if (!userData.ok) {
      console.error('Slack user info error:', userData);
      return res.status(400).json({ message: 'Failed to get user info from Slack' });
    }

    // Store user data in a simple session (in production, use a proper session system)
    const userInfo = {
      name: userData.profile?.real_name || userData.user?.real_name || userData.user?.name,
      avatar: userData.profile?.image_192 || userData.profile?.image_72 || userData.user?.image_192,
      slackId: userData.user?.id || userData.profile?.user_id,
      accessToken: tokenData.access_token
    };

    // Set a cookie with user data (simple approach - in production use proper session management)
    res.setHeader('Set-Cookie', [
      `userData=${JSON.stringify(userInfo)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
    ]);

    // Redirect to the app page
    res.redirect('/app');

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 