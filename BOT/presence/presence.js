module.exports = function presence(Discord, client, config){
    client.user.setPresence({ activity: { name: config.prefix + 'help | ' + client.guilds.cache.size + ' servers'}});
}