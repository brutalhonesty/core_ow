
'use strict';

const Discord = require('discord.js');
const moment = require('moment');
const cfg = require('./config.js');
const bot = new Discord.Client();

var offlineMap = {};

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
  if (msg.content.startsWith('!offline')) {
    var guild = msg.guild;
    var channel = msg.channel;
    var author = msg.author;
    let matched = msg.content.match(/<@([0-9]+)>/);
    if (!matched) {
      return;
    }
    var id = matched[1];
    var mentionedMember = guild.members.find('id', id);
    if (offlineMap[id]) {
      channel.sendMessage(author + ' ' + mentionedMember.user.username + ' went offline ' + moment(offlineMap[id]).utc().fromNow() + ' specifically ' + moment(offlineMap[id]).utc().format());
    } else {
      channel.sendMessage(author + ' ' + mentionedMember.user.username + ' has not gone offline or has not been recorded.');
    }
  }
});

bot.on("guildMemberAdd", (member) => {
  var owner = member.guild.owner;
  var interviewRole = member.guild.roles.find('name', 'Interview');
  owner.sendMessage(member.user.username + " has joined the server.");
  // For this to work, the Interview role needs to be further down in the list of roles than the Bot role.
  // You also need to grant role permissions to the bot when they join: 
  // https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID_HERE&scope=bot&permissions=0x10000000
  member.addRole(interviewRole).then((response) => {
    owner.sendMessage(member.user.username + " has been granted the Interview role.");
  }).catch((reason) => {
    console.error(reason);
  });
});

bot.on("guildMemberRemove", (member) => {
  var owner = member.guild.owner;
  owner.sendMessage(member.user.username + " has left the server.");
});

bot.login(cfg.token).then(() => {
  console.log('Logged in!');
});

bot.on('error', e => { 
  console.error(e);
});