import logger from '../../../utils/logger.js.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    const { slackId } = sessionData;

    // Validate Slack ID
    if (!slackId || typeof slackId !== 'string' || slackId.length < 3) {
      return res.status(400).json({ message: 'Invalid Slack ID' });
    }

    // Sanitize Slack ID
    const sanitizedSlackId = slackId.replace(/[^A-Z0-9]/gi, '');

    // Check if user already exists in Airtable
    const airtableBaseId = 'appu0BNsDItqYZrMl';
    const airtableTableId = 'tblK44riCxwsWenUq';
    
    const filterFormula = encodeURIComponent(`{Slack ID}='${sanitizedSlackId}'`);
    
    const checkResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}?filterByFormula=${filterFormula}`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });

    if (!checkResponse.ok) {
      logger.error('Airtable check failed:', await checkResponse.text());
      return res.status(500).json({ message: 'Failed to check existing user' });
    }

    const checkData = await checkResponse.json();

    // If user already exists, return success
    if (checkData.records && checkData.records.length > 0) {
      return res.json({ 
        message: 'User already exists',
        userId: checkData.records[0].id,
        slackId: sanitizedSlackId
      });
    }

    // Create new user record
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
              'Slack ID': sanitizedSlackId
            }
          }
        ]
      }),
    });

    if (!createResponse.ok) {
      logger.error('Failed to create user:', await createResponse.text());
      return res.status(500).json({ message: 'Failed to create user' });
    }

    const createData = await createResponse.json();
    
    res.json({ 
      message: 'User created successfully',
      userId: createData.records[0].id,
      slackId: sanitizedSlackId
    });

  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 