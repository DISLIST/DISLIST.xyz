const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const os = require('os-utils');
var io = require('socket.io-client');
const socket = io.connect('https://dislist.xyz/');
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
var map1 = [];

setInterval(() => {
  map = [];
  map1 = [];
}, 30000);


client.on('guildDelete', (guild) => {
  db.table('Servers').get(guild.id.toString()).update({
    bot: false,
    public: false
  }).run(global.conn, (err, res) => {
    if(err)console.log(chalk.red(err));
  });
});

client.on('message', msg => {
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
  
    if(msg.author != client.user){
      if(!(msg.channel instanceof Discord.DMChannel)){

        


        if(map1.indexOf(msg.author.id) == -1){
          map1.push(msg.author.id);
          db.table('Users').get(msg.author.id.toString()).run(global.conn, (err, res) => {
            if(err)console.log(chalk.red(err));
            if(res != null){
              var newlvl1;
              var newxp1;
              var newxpNeeded1;
              if(res.xp+5 >= res.xpNeeded){
                newlvl1 = res.level+1;
                newxp1 = 0;
                newxpNeeded1 = parseInt(res.xpNeeded*1.3);
              }else{
                newlvl1 = res.level;
                newxp1 = res.xp+parseInt(randomNum(5,15));
                newxpNeeded1 = parseInt(res.xpNeeded);
              }
  
  
              if(newlvl1 <= 14){
                var serverRank1 = "Bronze";
                var rankNumber1 = 0;
              }else if(newlvl1 >= 15 && newlvl1 <= 24){
                var serverRank1 = "Silver";
                var rankNumber1 = 1;
              }else if(newlvl1 >= 25 && newlvl1 <= 49){
                var serverRank1 = "Gold";
                var rankNumber1 = 2;
              }else if(newlvl1 >= 50 && newlvl1 <= 99){
                var serverRank1 = "Emerald";
                var rankNumber1 = 3;
              }else if(newlvl1 >= 100 && newlvl1 <= 199){
                var serverRank1 = "Diamond";
                var rankNumber1 = 4;
              }else if(newlvl1 >= 200){
                var serverRank1 = "Ruby";
                var rankNumber1 = 5;
              }
  
              db.table('Users').get(msg.author.id.toString()).update({
                xp: newxp1,
                xpNeeded: newxpNeeded1,
                level: newlvl1,
                rank: serverRank1,
                rankNum: rankNumber1
              }).run(global.conn, (err, res) => {
                if(err)console.log(chalk.red(err));
              });
            }
          });
        };


        if(map.indexOf(msg.guild.id) == -1){
          map.push(msg.guild.id);
        db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
          if(err)console.log(chalk.red(err));
          if(res != null){
            switch (res.premiumTier) {
              case 0:
                var xpModifier = 1;
                break;
                case 1:
                var xpModifier = 1.5;
                break;
                case 2:
                var xpModifier = 1.75;
                break;
                case 3:
                var xpModifier = 2;
                break;
            
              default:
                var xpModifier = 1;
                break;
            }
            var validXP = res.xp+parseInt(randomNum(5,15) * xpModifier);
            var newlvl;
            var newxp;
            var newxpNeeded;
            var newTotal;
            if(res.xp+validXP >= res.xpNeeded){
              newlvl = res.level+1;
              newxp = 0;
              newxpNeeded = parseInt(res.xpNeeded*1.3);
              newTotal = res.totalMessages+1;
            }else{
              newlvl = res.level;
              newxp = validXP;
              newxpNeeded = parseInt(res.xpNeeded);
              newTotal = res.totalMessages+1;
            }


            if(newlvl <= 14){
              var serverRank = "Bronze";
              var rankNumber = 0;
            }else if(newlvl >= 15 && newlvl <= 24){
              var serverRank = "Silver";
              var rankNumber = 1;
            }else if(newlvl >= 25 && newlvl <= 49){
              var serverRank = "Gold";
              var rankNumber = 2;
            }else if(newlvl >= 50 && newlvl <= 99){
              var serverRank = "Emerald";
              var rankNumber = 3;
            }else if(newlvl >= 100 && newlvl <= 199){
              var serverRank = "Diamond";
              var rankNumber = 4;
            }else if(newlvl >= 200){
              var serverRank = "Ruby";
              var rankNumber = 5;
            }

            db.table('Servers').get(msg.guild.id.toString()).update({
              users: msg.guild.members.cache.size,
              totalChannels: msg.guild.channels.cache.size,
              totalRoles: msg.guild.roles.cache.size,
              totalMessages: newTotal,
              xp: newxp,
              name: msg.guild.name.toString(),
              icon: msg.guild.icon,
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
                db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
                  if(err)console.log(chalk.red(err));
                  if(res != null){
                    var ownername = msg.guild.members.cache.get(res.owner);
                    if(res.premiumTier > 0){
                      var premium = true;
                    }else{
                      var premium = false;
                    }
                    var date = new Date(res.creationDate)
                    defaultembed = new Discord.MessageEmbed()
                    .setTitle(msg.guild.name.toUpperCase() + ` STATS`)
                    .addField('Name', `${res.name}`, true)
                    .addField('Owner', `${ownername.user.username}`, true)
                    .addField('Category', res.category, true)
                    .addField('Explicit', res.explicit, true)
                    .addField('Premium', `${premium}`, true)
                    .addField('Level', parseInt(res.level), true)
                    .addField('XP', `${parseInt(res.xp).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} / ${parseInt(res.xpNeeded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, true)
                    .addField('Rank', res.rank, true)
                    .addField('Posted On', date.toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    }), true)
                    .addField('Tags', '⠀' + res.tags.toString().replace(/,/g, '\n⠀'))
                    .addField('Description', res.description)
          
                    .setThumbnail(msg.guild.iconURL())
                    .setColor(config.embedcolor.message)
          
                    embed = defaultembed;
                    msg.channel.send({embed});
                  }else{
                    defaultembed = new Discord.MessageEmbed()
                    .setTitle('DISLIST.XYZ | A Discord server list')
                    .setURL('https://dislist.xyz/')
                    .setDescription(`**This server is not posted on DisList.xyz** ❌`)
                    .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
                
                    .setColor(config.embedcolor.error)
                
                    embed = defaultembed;
                    msg.channel.send({embed});
                  }
                });
            break;

            case config.prefix + 'url':
            db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
              if(err)console.log(chalk.red(err));
              if(res != null){
                defaultembed = new Discord.MessageEmbed()
                        .setTitle('DISLIST.XYZ | A Discord server list')
                        .setURL(`https://dislist.xyz/`)
                        .addField('**CLICK THE LINK BELOW TO VIEW THIS SERVER.**', `https://dislist.xyz/server?id=${msg.guild.id.toString()}`)
                        .setThumbnail('https://i.imgur.com/2Y5gpwH.gif')
              
                        .setColor(config.embedcolor.success)
              
                        embed = defaultembed;
                        msg.channel.send({embed});
              }else{
                defaultembed = new Discord.MessageEmbed()
                    .setTitle('DISLIST.XYZ | A Discord server list')
                    .setURL('https://dislist.xyz/')
                    .setDescription(`**This server is not posted on DisList.xyz** ❌`)
                    .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
                
                    .setColor(config.embedcolor.error)
                
                    embed = defaultembed;
                    msg.channel.send({embed});
              }
            })
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
                        .setTitle('DISLIST.XYZ | A Discord server list')
                        .setURL('https://dislist.xyz/')
                        .setDescription(`**Server Successfully Bumped** :white_check_mark:`)
                        .setThumbnail('https://i.imgur.com/2Y5gpwH.gif')
              
                        .setColor(config.embedcolor.success)
              
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
                        .setTitle('DISLIST.XYZ | A Discord server list')
                        .setURL('https://dislist.xyz/')
                        .setDescription(`**BUMP FAILED** *Time left:* **${parseInt(hours)}H | ${parseInt(minutes)}M | ${parseInt(seconds)}S**`)
                        .setColor(config.embedcolor.error)
                        .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
                    
                        embed = defaultembed;
                        msg.channel.send({embed});
                    }
                  }else{
                    defaultembed = new Discord.MessageEmbed()
                    .setTitle('DISLIST.XYZ | A Discord server list')
                    .setURL('https://dislist.xyz/')
                    .setDescription(`**This server is not posted on DisList.xyz** ❌`)
                    .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
                
                    .setColor(config.embedcolor.error)
                
                    embed = defaultembed;
                    msg.channel.send({embed});
                  }
                });
            break;

            case config.prefix + 'invite':
              if(msg.guild.members.cache.get(msg.author.id).hasPermission('ADMINISTRATOR')){
                if(msg.guild.members.cache.get(client.user.id).hasPermission('CREATE_INSTANT_INVITE')){
                if(msg.mentions.channels.first()) {
                    const newInv = msg.mentions.channels.first().createInvite({maxAge: 0});
                }
                else {
                    const newInv = msg.channel.createInvite({maxAge: 0});
                }
                    
              newInv.then((inv) => {
                db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
                  if(err)console.log(chalk.red(err));
                  if(res != null){


                    if(res.public == false){
                      db.table('Servers').get(msg.guild.id.toString()).update({
                        invite: inv.url.toString(),
                        bot: true,
                        public: true,
                        users: msg.guild.members.cache.size,
                        totalChannels: msg.guild.channels.cache.size,
                        totalRoles: msg.guild.roles.cache.size
                      }).run(global.conn, (err, res) => {
                        if(err)console.log(chalk.red(err));
                        defaultembed = new Discord.MessageEmbed()
                        .setTitle('DISLIST.XYZ | A Discord server list')
                        .setURL('https://dislist.xyz/')
                        .setDescription(`*:white_check_mark: Invite Created For Channel*: **${inv.channel.name.toString().toLocaleUpperCase()}**`)
                        .setThumbnail('https://i.imgur.com/2Y5gpwH.gif')
              
                        .setColor(config.embedcolor.message)
              
                        embed = defaultembed;
                        msg.channel.send({embed});
                      });
                    }else{
                      db.table('Servers').get(msg.guild.id.toString()).update({
                        invite: inv.url.toString(),
                        bot: true,
                        users: msg.guild.members.cache.size,
                        totalChannels: msg.guild.channels.cache.size,
                        totalRoles: msg.guild.roles.cache.size
                      }).run(global.conn, (err, res) => {
                        if(err)console.log(chalk.red(err));
                        defaultembed = new Discord.MessageEmbed()
                        .setTitle('DISLIST.XYZ | A Discord server list')
                        .setURL('https://dislist.xyz/')
                        .setDescription(`*:white_check_mark: Invite Changed To*: **${inv.channel.name.toString().toLocaleUpperCase()}**`)
                        .setThumbnail('https://i.imgur.com/2Y5gpwH.gif')
              
                        .setColor(config.embedcolor.message)
              
                        embed = defaultembed;
                        msg.channel.send({embed});
                      });
                    }
                  }else{
                    defaultembed = new Discord.MessageEmbed()
                    .setTitle('DISLIST.XYZ | A Discord server list')
                    .setURL('https://dislist.xyz/')
                    .setDescription(`**This server is not posted on DisList.xyz** ❌`)
                    .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
                
                    .setColor(config.embedcolor.error)
                
                    embed = defaultembed;
                    msg.channel.send({embed});
                  }
                });

                db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
                  if(err)console.log(chalk.red(err));
                  if(res != null){
                    if(res.public == false){
                      defaultembed = new Discord.MessageEmbed()
                      .setTitle('DISLIST.XYZ | A Discord server list')
                      .setURL('https://dislist.xyz/')
                      .setDescription(`**SERVER ADDED**`)
                      .addField('NAME', `${res.name}`, true)
                      .addField('USERS', `${res.users}`, true)
                      .addField('INVITE', `${res.invite}`, true)
                      .setThumbnail('https://i.imgur.com/2Y5gpwH.gif')
            
                      .setColor(config.embedcolor.success)
            
                      embed = defaultembed;
                      client.channels.cache.get('735246011412250746').send({embed});
                    }
                  }
                });
              });
            }else{
              defaultembed = new Discord.MessageEmbed()
              .setTitle('DISLIST.XYZ | A Discord server list')
              .setURL('https://dislist.xyz/')
                .setDescription('**DISLIST REQUIRES** the following permissions: \n **`CREATE_INSTANT_INVITE`** \n **`SEND_MESSAGES`**')
            
                .setColor(config.embedcolor.error)
            
                embed = defaultembed;
                msg.channel.send({embed});
            }
              }else{
                defaultembed = new Discord.MessageEmbed()
                .setTitle('DISLIST.XYZ | A Discord server list')
                .setURL('https://dislist.xyz/')
                .setDescription(`**You don't have permission to do this** ❌`)
                .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
            
                .setColor(config.embedcolor.error)
            
                embed = defaultembed;
                msg.channel.send({embed});
              }
            break;

            //GENERAL COMMANDS
            case config.prefix + 'status':
                status(msg, Discord, client, os, config);
            break;


            case config.prefix + 'setstaff':
              if(msg.author.id == '712889190315982891'){
                db.table('Users').get(msg.mentions.users.first().id.toString()).run(global.conn, (err, res) => {
                  if(err)console.log(chalk.red(err));
                  if(res != null){
                    db.table('Users').get(msg.mentions.users.first().id.toString()).update({
                      staffTier: parseInt(args[1])
                    }).run(global.conn, (err, res) => {
                      defaultembed = new Discord.MessageEmbed()
                      .setTitle('DISLIST.XYZ | A Discord server list')
                      .setURL('https://dislist.xyz/')
                      .setDescription(`:white_check_mark: **WHOA** ${msg.mentions.users.first().username.toString()} was made **STAFF**`)
                      .setThumbnail('https://i.imgur.com/jYuQEtl.jpg')
            
                      .setColor(config.embedcolor.success)
            
                      embed = defaultembed;
                      msg.channel.send({embed});
                    })
                  }else{
                    defaultembed = new Discord.MessageEmbed()
                      .setTitle('DISLIST.XYZ | A Discord server list')
                      .setURL('https://dislist.xyz/')
                      .setDescription(`:x: ${msg.mentions.users.first().username.toString()} isnt registered on DISLIST`)
                      .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
            
                      .setColor(config.embedcolor.error)
            
                      embed = defaultembed;
                      msg.channel.send({embed});
                  }
                })
              }
            break;




            case config.prefix + 'setpremium':
              if(msg.author.id == '712889190315982891'){
                if(args[0] != null){
                db.table('Servers').get(msg.guild.id.toString()).run(global.conn, (err, res) => {
                  if(err)console.log(chalk.red(err));
                  if(res != null){
                    db.table('Servers').get(msg.guild.id.toString()).update({
                      premiumTier: parseInt(args[0])
                    }).run(global.conn, (err, res) => {
                      if(err)console.log(chalk.red(err));
                      defaultembed = new Discord.MessageEmbed()
                      .setTitle('DISLIST.XYZ | A Discord server list')
                      .setURL('https://dislist.xyz/')
                      .setDescription(`:white_check_mark: **CONGRATS** You've been given: **Premium Tier ${args[0]}**`)
                      .setThumbnail('https://i.imgur.com/jYuQEtl.jpg')
            
                      .setColor(config.embedcolor.success)
            
                      embed = defaultembed;
                      msg.channel.send({embed});
                    });
                  }else{
                    defaultembed = new Discord.MessageEmbed()
                      .setTitle('DISLIST.XYZ | A Discord server list')
                      .setURL('https://dislist.xyz/')
                      .setDescription(`:x: This server isnt posted on DISLIST`)
                      .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
            
                      .setColor(config.embedcolor.error)
            
                      embed = defaultembed;
                      msg.channel.send({embed});
                  }
                });
              }else{
                defaultembed = new Discord.MessageEmbed()
                      .setTitle('DISLIST.XYZ | A Discord server list')
                      .setURL('https://dislist.xyz/')
                      .setDescription(`*:x: You must supply a premium tier to give this server.*`)
                      .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
            
                      .setColor(config.embedcolor.error)
            
                      embed = defaultembed;
                      msg.channel.send({embed});
              }
            }else{
              defaultembed = new Discord.MessageEmbed()
                      .setTitle('DISLIST.XYZ | A Discord server list')
                      .setURL('https://dislist.xyz/')
                      .setDescription(`*:x: You don't have permission to do this.*`)
                      .setThumbnail('https://i.imgur.com/YFiJVaq.gif')
            
                      .setColor(config.embedcolor.error)
            
                      embed = defaultembed;
                      msg.channel.send({embed});
            }
            break;



      }
      } 
    }
  });


function randomNum(i1, i2){
  return Math.floor(Math.random() * i2 + i1);
}


client.login(config.token);
