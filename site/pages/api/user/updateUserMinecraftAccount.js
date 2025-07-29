export default async function handler(req, res) {
  if (req.method !== 'PUT') {
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
      console.error('Failed to parse userData cookie:', parseError);
      return res.status(401).json({ message: 'Invalid session data' });
    }

    const { minecraftUsername } = req.body;

    // Validate Minecraft username
    if (!minecraftUsername || typeof minecraftUsername !== 'string') {
      return res.status(400).json({ message: 'Minecraft username is required' });
    }

    // Sanitize Minecraft username (alphanumeric and underscores only, 3-16 characters)
    const sanitizedMinecraftUsername = minecraftUsername.replace(/[^A-Za-z0-9_]/g, '').substring(0, 16);
    
    if (sanitizedMinecraftUsername.length < 3) {
      return res.status(400).json({ message: 'Minecraft username must be at least 3 characters' });
    }

    // Find the user record in Airtable
    const airtableBaseId = 'appu0BNsDItqYZrMl';
    const airtableTableId = 'tblK44riCxwsWenUq';
    
    const filterFormula = encodeURIComponent(`{Slack ID}='${sessionData.slackId}'`);
    
    const findResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}?filterByFormula=${filterFormula}`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });

    if (!findResponse.ok) {
      console.error('Failed to find user:', await findResponse.text());
      return res.status(500).json({ message: 'Failed to find user record' });
    }

    const findData = await findResponse.json();

    if (!findData.records || findData.records.length === 0) {
      return res.status(404).json({ message: 'User record not found' });
    }

    const userRecord = findData.records[0];

    // Update the user record with Minecraft username
    const updateResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            id: userRecord.id,
            fields: {
              'Minecraft Username': sanitizedMinecraftUsername
            }
          }
        ]
      }),
    });

    if (!updateResponse.ok) {
      console.error('Failed to update user:', await updateResponse.text());
      return res.status(500).json({ message: 'Failed to update Minecraft username' });
    }

    const updateData = await updateResponse.json();
    
    res.json({ 
      message: 'Minecraft username updated successfully',
      minecraftUsername: sanitizedMinecraftUsername,
      recordId: updateData.records[0].id
    });

  } catch (error) {
    console.error('Update Minecraft account error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 