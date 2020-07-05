module.exports = function help(msg, Discord, client, config, args){




    defaultembed = new Discord.MessageEmbed()
    .setAuthor(client.user.username + ' HELP MENU', client.user.avatarURL())
    .addField('⠀', '**COMMANDS** \n \n`' + config.prefix + 'Help` \n The general help menu for ' + client.user.username)
    .addField('⠀', '`' + config.prefix + 'Status` \n Get the status of ' + client.user.username)
    .addField('⠀', '`' + config.prefix + 'Bump` \n Bump your server on ' + client.user.username)
    .addField('⠀', '`' + config.prefix + 'Invite` \n Create an Invite for your server. [If you just made your server this will make your server go public.] ')

    .setColor(config.embedcolor.message)
    .setTimestamp()

    embed = defaultembed;
    msg.channel.send({embed});
}