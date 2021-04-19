module.exports = {
  // Proxy Auth0 URL, used to get TC M2M token
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,
  // Auth0 URL, used to get TC M2M token
  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder-dev.auth0.com/oauth/token',
  // Auth0 audience, used to get TC M2M token
  AUTH0_TOPCODER_AUDIENCE: process.env.AUTH0_TOPCODER_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  // Auth0 audience for U-Bahn
  AUTH0_UBAHN_AUDIENCE: process.env.AUTH0_UBAHN_AUDIENCE || 'https://u-bahn.topcoder.com',
  // Auth0 client id, used to get TC M2M token
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  // Auth0 client secret, used to get TC M2M token
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  // The ubahn api url
  UBAHN_API_URL: process.env.UBAHN_API_URL || 'https://api.topcoder-dev.com/v5',
  // The topcoder api url
  TC_API_URL: process.env.TC_API_URL || 'https://api.topcoder-dev.com',
  // The skill provider name
  SKILL_PROVIDER_NAME: process.env.SKILL_PROVIDER_NAME || 'Topcoder',
  // The pause time between two create operations, default value: 1000 ms
  SLEEP_TIME: parseInt(process.env.SLEEP_TIME || 1000)
}
