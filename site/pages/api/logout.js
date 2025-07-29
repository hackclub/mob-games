import logger from '../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Set cookie options based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      'Path=/',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    ];
    
    if (isProduction) {
      cookieOptions.push('Secure');
    }
    
    cookieOptions.push('SameSite=Strict');

    // Clear the userData cookie by setting it to expire in the past
    res.setHeader('Set-Cookie', [
      `userData=; ${cookieOptions.join('; ')}`,
      `userData=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`,
      `userData=; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    ]);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 