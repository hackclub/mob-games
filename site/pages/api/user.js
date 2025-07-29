export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session data from cookie
    const userDataCookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith('userData='));
    
    if (!userDataCookie) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const sessionData = JSON.parse(userDataCookie.split('=')[1]);
    
    // Fetch fresh user data from Slack using the access token
    const userResponse = await fetch('https://slack.com/api/users.identity', {
      headers: {
        'Authorization': `Bearer ${sessionData.accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.ok) {
      console.error('Slack user info error:', userData);
      return res.status(401).json({ message: 'Failed to get user info from Slack' });
    }

    // Return fresh user data
    res.json({
      name: userData.user.name || userData.user.real_name,
      avatar: userData.user.image_192 || userData.user.image_72,
      slackId: userData.user.id
    });

  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 