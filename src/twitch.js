import TwitchApi from 'twitch-api';
import moment from 'moment';

import config from './config';
const twitch = new TwitchApi({
  clientId: config.twitch.clientId,
  clientSecret: config.twitch.clientSecret,
  redirectUri: 'http://localhost:3000',
  scopes: [],
});
const streamers = config.twitch.streamers;

export const publishedStreams = {};

export const getCoreStreamers = (callback) => {
  twitch.getStreams({
    channel: streamers.join(','),
  }, function (error, body) {
    if(error) {
      return callback(error);
    }
    return callback(null, body.streams);
  });
};

const getStreamChannels = (bot, callback) => {
  const streamChannels = [];
  for (var i = 0; i < bot.guilds.array().length; i++) {
    const guild = bot.guilds.array()[i];
    const channels = bot.guilds.find('id', guild.id).channels.filter((channel) => {
      return channel.type === 'text' && channel.name === 'streaming';
    });
    streamChannels.push({guildId: guild.id, channels: channels});
  }
  return callback(null, streamChannels);
};

export const broadcastStreams = (bot, streams) => {
  for (var i = 0; i < streams.length; i++) {
    const stream = streams[i];
    const twitchChannel = stream.channel;
    const streamMessage = `Hey @here! ${twitchChannel.display_name} is now live on ${twitchChannel.url} ! Go check it out!\n`;
    getStreamChannels(bot, (error, guilds) => {
      for (var j = 0; j < guilds.length; j++) {
        const guild = guilds[j];
        for (var k = 0; k < guild.channels.array().length; k++) {
          const discordChannel = guild.channels.array()[k];
          bot.channels.find('id', discordChannel.id).sendMessage(streamMessage);
          console.log('Added streamer %s as they are live.', twitchChannel.name);
          publishedStreams[twitchChannel.name] = {
            start: moment(stream.created_at).valueOf(),
            end: null,
          };
          console.log(publishedStreams);
        }
      }
    });
  }
};