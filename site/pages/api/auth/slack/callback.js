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
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
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

    // Validate and sanitize user data
    const slackId = userData.user.id;
    const userName = userData.user.real_name || userData.user.name;

    // Input validation
    if (!slackId || typeof slackId !== 'string' || slackId.length > 50) {
      console.error('Invalid Slack ID:', slackId);
      return res.status(400).json({ message: 'Invalid user data' });
    }

    if (!userName || typeof userName !== 'string' || userName.length > 100) {
      console.error('Invalid user name:', userName);
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // Sanitize inputs - remove any potentially dangerous characters
    const sanitizedSlackId = slackId.replace(/[^A-Z0-9]/gi, '');
    const sanitizedUserName = userName.replace(/[<>\"'&]/g, '').trim();

    // Validate sanitized data
    if (!sanitizedSlackId || sanitizedSlackId.length < 3) {
      console.error('Slack ID too short after sanitization:', sanitizedSlackId);
      return res.status(400).json({ message: 'Invalid user data' });
    }

    if (!sanitizedUserName || sanitizedUserName.length < 1) {
      console.error('User name too short after sanitization:', sanitizedUserName);
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // Check if player already exists in Airtable
    const airtableBaseId = 'appu0BNsDItqYZrMl';
    const airtableTableId = 'tblK44riCxwsWenUq';
    
    // Use proper URL encoding for the filter formula
    const filterFormula = encodeURIComponent(`{Slack ID}='${sanitizedSlackId}'`);
    
    const checkResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}?filterByFormula=${filterFormula}`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });

    if (!checkResponse.ok) {
      console.error('Airtable check failed:', await checkResponse.text());
      // Continue with login even if Airtable check fails
    } else {
      const checkData = await checkResponse.json();

      // If no existing record found, create a new one
      if (!checkData.records || checkData.records.length === 0) {
        const createResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  'Slack ID': sanitizedSlackId,
                  'Name': sanitizedUserName,
                  'Created At': new Date().toISOString()
                }
              }
            ]
          }),
        });

        if (!createResponse.ok) {
          console.error('Failed to create Airtable record:', await createResponse.text());
        } else {
          console.log('Created new player record for:', sanitizedUserName);
        }
      } else {
        console.log('Player already exists in Airtable:', sanitizedUserName);
      }
    }

    // Store session data with user info
    const sessionData = {
      slackId: sanitizedSlackId,
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