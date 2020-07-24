module.exports = function help(msg, Discord, client, config, args){




    defaultembed = new Discord.MessageEmbed()
    .setAuthor('DISLIST HELP MENU', client.user.avatarURL())
    .setDescription('**COMMANDS** \n \n `' + 
    config.prefix + 'Help` | The general help menu for ' + client.user.username + '\n \n `' + 
    config.prefix + 'Status` | Get the status of ' + client.user.username + '\n \n `' + 
    config.prefix + 'Bump` | Bump your server on ' + client.user.username + '\n \n `' +
    config.prefix + 'Stats` | Get the stats of your server. \n \n `' +
    config.prefix + 'Url` | Get the url to your server page. \n \n `' +
    config.prefix + 'Invite` | Create an Invite for your server. [If you just made your server this will make your server go public.]')

    .setColor(config.embedcolor.message)
    .setThumbnail(client.user.avatarURL())
    .setTimestamp()

    embed = defaultembed;
    msg.channel.send({embed});
}