
'use strict';

const Discord = require('discord.js');
const moment = require('moment');
const cfg = require('./config.js');
const bot = new Discord.Client();

const neosiusId = '162648531688095744';

var offlineMap = {};

var commands = {
  '!offline': 'Given a username, check how long its been since they have been online.\nUsage !offline <username>'
};

var welcomeMessage = "**Hello and welcome, my name is Jarvis and I will help you get started here in CORE**\n\n■ **To learn more about CORE click on READ**\n\n■ **If you are looking to join a Team, become a Captain or Coach click on PROSPECTS**\n\n■ **If you have been recruited and are trying out for a team click on TRYOUT.**\n\n■ **If you have further questions please reach out directly to DPHIANCE the Owner of CORE**\n{because apparently I am not very \"personable\", I'd like to see GLaDOS do a better job}\n\n**I am glad that I could assist you today**";

bot.on('ready', () => {
  bot.users.forEach((user) => {
    if(user.bot) {
      return;
    }
    if (user.presence.status === 'offline' && !offlineMap[user.id]) {
      offlineMap[user.id] = moment().utc().valueOf();
    }
  });
  console.log('Running!');
});

bot.on('presenceUpdate', (oldMember, newMember) => {
  // Both oldMember and newMember have the same values we care about.
  var user = newMember.user;
  if (user.presence.status === 'offline') {
    offlineMap[user.id] = moment().utc().valueOf();
  }
  if (user.presence.status !== 'offline' && offlineMap[user.id]) {
    delete offlineMap[user.id];
  }
});

bot.on('message', msg => {
  if (msg.channel.type === 'dm') {
    return;
  }
  var guild = msg.guild;
  var owner = guild.owner;
  var channel = msg.channel;
  var author = msg.author;
  if (author !== owner) {
    return;
  }
  if (msg.content.startsWith('!offline')) {
    let matched = msg.content.match(/<@!?([0-9]+)>/);
    if (!matched) {
      return;
    }
    var id = matched[1];
    var mentionedMember = guild.members.find('id', id);
    if (offlineMap[id]) {
      channel.sendMessage(author + ' ' + mentionedMember.user.username + ' went offline ' + moment(offlineMap[id]).utc().fromNow() + ' @ ' + moment(offlineMap[id]).utc().format());
    } else {
      channel.sendMessage(author + ' ' + mentionedMember.user.username + ' has not gone offline or has not been recorded.');
    }
  }
  if (msg.content.startsWith('!commands')) {
    var commandStr = '';
    for (var command in commands) {
      commandStr += (command + ': ' + commands[command] + '\n');
    }
    channel.sendMessage(commandStr);
  }
});

bot.on('guildMemberAdd', (member) => {
  var owner = member.guild.owner;
  var neosius = member.guild.members.find('id', neosiusId);
  var interviewRole = member.guild.roles.find('name', 'PROSPECT');
  var joinMessage = member.user.username + ' has joined the server.';
  owner.sendMessage(joinMessage);
  if(neosius != null) {
    neosius.sendMessage(joinMessage);
  }
  // For this to work, the Interview role needs to be further down in the list of roles than the Bot role.
  // You also need to grant role permissions to the bot when they join: 
  // https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID_HERE&scope=bot&permissions=0x10000000
  member.addRole(interviewRole).then((response) => {
    var roleGrantMessage = member.user.username + ' has been granted the PROSPECT role.';
    owner.sendMessage(roleGrantMessage);
    if(neosius != null) {
      neosius.sendMessage(roleGrantMessage);
    }
  }).catch((reason) => {
    console.error(reason);
  });
  member.sendMessage(welcomeMessage);
});

bot.on('guildMemberRemove', (member) => {
  var owner = member.guild.owner;
  var neosius = member.guild.members.find('id', neosiusId);
  var leftMessage = member.user.username + ' has left the server.';
  owner.sendMessage(leftMessage);
  if(neosius != null) {
    neosius.sendMessage(leftMessage);
  }
});

bot.login(cfg.token).then(() => {
  console.log('Logged in!');
});

bot.on('error', e => { 
  console.error(e);
});
