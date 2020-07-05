const Discord = require('discord.js');
const config = require('./config.json');
const chalk = require('chalk');
const Manager = new Discord.ShardingManager('./dislist.js', {token: config.token});
Manager.spawn('auto');
console.log(chalk.grey('[' + chalk.red('SHARDS') + ']Shards Initialized: ' + chalk.red(Manager.shards.size)));