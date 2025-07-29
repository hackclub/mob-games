export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user data from cookie
    const userDataCookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith('userData='));
    
    console.log('Cookies:', req.headers.cookie);
    console.log('User data cookie:', userDataCookie);
    
    if (!userDataCookie) {
      console.log('No userData cookie found');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userData = JSON.parse(userDataCookie.split('=')[1]);
    console.log('Parsed user data:', userData);
    
    // Return user data (excluding access token for security)
    res.json({
      name: userData.name,
      avatar: userData.avatar,
      slackId: userData.slackId
    });

  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 