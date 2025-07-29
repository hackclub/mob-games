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
    
    // Fetch fresh user data from Slack using the users.info API
    const userResponse = await fetch('https://slack.com/api/users.info', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        user: sessionData.slackId
      }),
    });

    const userData = await userResponse.json();

    if (!userData.ok) {
      console.error('Slack users.info error:', userData);
      return res.status(401).json({ message: 'Failed to get user info from Slack' });
    }

    // Return fresh user data from users.info
    res.json({
      name: userData.user.real_name || userData.user.name,
      email: userData.user.profile?.email,
      avatar: userData.user.profile?.image_192 || userData.user.profile?.image_72,
      slackId: userData.user.id
    });

  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 