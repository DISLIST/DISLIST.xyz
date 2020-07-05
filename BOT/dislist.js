const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const os = require('os-utils');
var io = require('socket.io-client');
const socket = io.connect('http://localhost/');
const config = require('./config.json');
const db = require('rethinkdb');
//COMMANDS
const help = require('./commands/help.js');
const status = require('./commands/status.js');

//PRESENCE
const presence = require('./presence/presence.js');



client.on('ready', () => {
  socket.emit('botConn', {name: client.user.tag});
    presence(Discord, client, config);
    setInterval(() => {
        presence(Discord, client, config);
    }, 15000);
    db.connect({ 
      host: 'localhost', 
      port: '28015', 
      db: 'DisList'}
  , function(err, conn) {
      global.conn = conn;
      if(err)console.log(chalk.red(err));
      console.log(chalk.grey('[' + chalk.cyan('DB') + ']Logged in to Database: ' + chalk.cyan(conn.db) + ' Address: ' + chalk.cyan(conn.host + ':' + conn.port)));
  });
    console.log(chalk.grey('[' + chalk.red('LOGIN') + ']Logged in as: ' + chalk.red(client.user.tag)));
});

var map = [];

setInterval(() => {
  map = [];
}, 30000);

client.on('message', msg => {
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
  
    if(msg.author != client.user){
      if(!(msg.channel instanceof Discord.DMChannel)){


        if(map.indexOf(msg.guild.id) == -1){
          map.push(msg.guild.id);
        db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
          if(err)console.log(chalk.red(err));
          if(res != null){
            var newlvl;
            var newxp;
            var newxpNeeded;
            var newTotal;
            if(res.xp+5 >= res.xpNeeded){
              newlvl = res.level+1;
              newxp = 0;
              newxpNeeded = parseInt(res.xpNeeded*1.3);
              newTotal = res.totalMessages+1;
            }else{
              newlvl = res.level;
              newxp = res.xp+5;
              newxpNeeded = parseInt(res.xpNeeded);
              newTotal = res.totalMessages+1;
            }

            switch (newlvl) {
              case 1:
                var serverRank = "Bronze";
                var rankNumber = 0;
                break;
              case 15:
                var serverRank = "Silver";
                var rankNumber = 1;
                break;
              case 25:
                var serverRank = "Gold";
                var rankNumber = 2;
                break;
              case 50:
                var serverRank = "Diamond";
                var rankNumber = 3;
                break;
              case 100:
                var serverRank = "Ruby";
                var rankNumber = 4;
                break;
                default:
                  var serverRank = "Bronze";
                  var rankNumber = 0;
                  break;
            }

            db.table('Servers').get(msg.guild.id.toString()).update({
              users: msg.guild.members.cache.size,
              totalChannels: msg.guild.channels.cache.size,
              totalRoles: msg.guild.roles.cache.size,
              totalMessages: newTotal,
              xp: newxp,
              xpNeeded: newxpNeeded,
              level: newlvl,
              rank: serverRank,
              rankNum: rankNumber
            }).run(global.conn, (err, res) => {
              if(err)console.log(chalk.red(err));
            });
          }
        });
      }
  
        switch(msg.content.toLocaleLowerCase().split(' ')[0]) {
  





            //GENERAL COMMANDS
            case config.prefix + 'help':
                help(msg, Discord, client, config, args);
            break;

            case config.prefix + 'stats':
                
            break;

            case config.prefix + 'bump':
                db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
                  if(err)console.log(chalk.red(err));
                  if(res != null){
                    var lastBump = new Date(res.lastBumpTime);
                    var nextBump = new Date(res.lastBumpTime);
                    nextBump.setHours(nextBump.getHours()+2);
                    var currentDate = new Date();
                    if(currentDate > nextBump){
                      var date = new Date().getTime();
                      db.table('Servers').get(msg.guild.id).update({
                        lastBumpTime: date
                      }).run(global.conn, (err, res) => {
                        if(err)console.log(chalk.red(err));
                        defaultembed = new Discord.MessageEmbed()
                        .setAuthor(`Server Successfully Bumped ✔️`)
              
                        .setColor(config.embedcolor.message)
              
                        embed = defaultembed;
                        msg.channel.send({embed});
                      });
                    }else{
                        var bumpTimer = nextBump.getTime() - currentDate.getTime();
                        x = parseInt(bumpTimer) / 1000;
                        seconds = x % 60;
                        x /= 60;
                        minutes = x % 60;
                        x /= 60;
                        hours = x % 24;
                        defaultembed = new Discord.MessageEmbed()
                        .setAuthor(`BUMP FAILED: You can bump this server in ${parseInt(hours)}H | ${parseInt(minutes)}M | ${parseInt(seconds)}S ❌`)
                    
                        .setColor(config.embedcolor.message)
                    
                        embed = defaultembed;
                        msg.channel.send({embed});
                    }
                  }else{
                    defaultembed = new Discord.MessageEmbed()
                    .setAuthor(`This server is not posted on DisList.xyz. ❌`)
                
                    .setColor(config.embedcolor.message)
                
                    embed = defaultembed;
                    msg.channel.send({embed});
                  }
                });
            break;

            case config.prefix + 'invite':
              if(msg.guild.members.cache.get(msg.author.id).hasPermission('ADMINISTRATOR')){
                if(msg.guild.members.cache.get(client.user.id).hasPermission('CREATE_INSTANT_INVITE') && msg.guild.members.cache.get(client.user.id).hasPermission('SEND_MESSAGES')){
                var newInv = msg.channel.createInvite({maxAge: 0});
              newInv.then((inv) => {
                db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
                  if(err)console.log(chalk.red(err));
                  if(res != null){
                    db.table('Servers').get(msg.guild.id.toString()).update({
                      invite: inv.url.toString(),
                      public: true,
                      users: msg.guild.members.cache.size,
                      totalChannels: msg.guild.channels.cache.size,
                      totalRoles: msg.guild.roles.cache.size
                    }).run(global.conn, (err, res) => {
                      if(err)console.log(chalk.red(err));
                      defaultembed = new Discord.MessageEmbed()
                      .setAuthor(`Invite Created For Channel: ${inv.channel.name.toString().toLocaleUpperCase()} ✔️`)
            
                      .setColor(config.embedcolor.message)
            
                      embed = defaultembed;
                      msg.channel.send({embed});
                    });
                  }else{
                    defaultembed = new Discord.MessageEmbed()
                    .setAuthor(`This server is not posted on DisList.xyz. ❌`)
                
                    .setColor(config.embedcolor.message)
                
                    embed = defaultembed;
                    msg.channel.send({embed});
                  }
                });
              });
            }else{
              defaultembed = new Discord.MessageEmbed()
                .setAuthor('Please give me the `CREATE_INSTANT_INVITE` and `SEND_MESSAGES` permissions. ❌')
            
                .setColor(config.embedcolor.message)
            
                embed = defaultembed;
                msg.channel.send({embed});
            }
              }else{
                defaultembed = new Discord.MessageEmbed()
                .setAuthor(`You don't have permission to do this. ❌`)
            
                .setColor(config.embedcolor.message)
            
                embed = defaultembed;
                msg.channel.send({embed});
              }
            break;

            //GENERAL COMMANDS
            case config.prefix + 'status':
                status(msg, Discord, client, os, config);
            break;



      }
      } 
    }
  });

client.login(config.token);