module.exports = function status(msg, discord, client, os, config){

    x = parseInt(client.uptime) / 1000;
    seconds = x % 60;
    x /= 60;
    minutes = x % 60;
    x /= 60;
    hours = x % 24;
    x /= 24;
    days = x;

    var embed = new discord.MessageEmbed()
    //TITLE
    .setAuthor(client.user.username.toString() + ' Status:')
    .setColor(config.embedcolor.message)

    //INFO
    .addField('Uptime:', parseInt(days).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'D ' + parseInt(hours) + 'H ' + parseInt(minutes) + 'M ' + parseInt(seconds) + 'S', true)
    .addField('Active Shards:', client.shard.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' Shards', true)
    .addField('Guilds:', client.guilds.cache.size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), true)
    .addField('Connected Users:', client.users.cache.size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), true)
    .addField('Bots Ping:', parseInt(client.ws.ping), true)
    .addField('Total Channels:', parseInt(client.channels.cache.size).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), true)
    .addField('Voice Channels:', parseInt(client.voice.connections.size).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), true)
    .addField('Operating System:', os.platform(), true)
    .addField('Bot Created On:', client.user.createdAt.toLocaleString(), true)
    .addField('Bot Joined On:', msg.guild.member(client.user.id).joinedAt.toLocaleString(), true)
    .addField('Free Memory:', parseInt(os.freemem()).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' MB', true)
    .addField('Total Memory:', parseInt(os.totalmem()).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' MB', true)

    //FOOTER
    .setFooter("Sent by: " + client.user.username.toString(), client.user.avatarURL)
    .setThumbnail(client.user.avatarURL)
    .setTimestamp();
    msg.channel.send({embed});

}