import Head from 'next/head';

export default function Login() {
  const handleSlackLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = 'https://mob-games.hackclub.dev/api/auth/slack/callback';
    const scope = 'users:read,users.profile:read';
    
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    window.location.href = slackAuthUrl;
  };

  return (
    <>
      <Head>
        <title>Login - Mob Games</title>
      </Head>
      <button onClick={handleSlackLogin}>
        Login with Slack
      </button>
    </>
  );
} 