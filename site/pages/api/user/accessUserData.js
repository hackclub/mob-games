import logger from '../../../utils/logger';

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

    let sessionData;
    try {
      sessionData = JSON.parse(userDataCookie.split('=')[1]);
    } catch (parseError) {
      logger.error('Failed to parse userData cookie:', parseError);
      return res.status(401).json({ message: 'Invalid session data' });
    }
    
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
      logger.error('Slack users.info error:', userData);
      return res.status(401).json({ message: 'Failed to get user info from Slack' });
    }

    // Get user data from Airtable
    const airtableBaseId = 'appu0BNsDItqYZrMl';
    const airtableTableId = 'tblK44riCxwsWenUq';
    
    const filterFormula = encodeURIComponent(`{Slack ID}='${sessionData.slackId}'`);
    
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}?filterByFormula=${filterFormula}`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });

    let airtableData = null;
    if (airtableResponse.ok) {
      const airtableResult = await airtableResponse.json();
      if (airtableResult.records && airtableResult.records.length > 0) {
        airtableData = airtableResult.records[0];
      }
    }

    // Return combined data
    res.json({
      // Slack data
      slack: {
        name: userData.user.real_name || userData.user.name,
        email: userData.user.profile?.email,
        avatar: userData.user.profile?.image_192 || userData.user.profile?.image_72,
        slackId: userData.user.id
      },
      // Airtable data
      airtable: airtableData ? {
        recordId: airtableData.id,
        slackId: airtableData.fields['Slack ID'],
        minecraftUsername: airtableData.fields['Minecraft Username'] || null
      } : null
    });

  } catch (error) {
    logger.error('Access user data error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 