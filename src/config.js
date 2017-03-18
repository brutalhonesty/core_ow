module.exports = {
  // Your bot's user token. If you don't know what that is, go here:
  // https://discordapp.com/developers/applications/me
  // Then create a new application and grab your token.
  token: process.env.BOT_TOKEN,
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    streamers: ['nefarious_ow', 'matcuth', 'be_ne_ne', 'sparky_ow', 'anthony_kongphan']
  }
};
