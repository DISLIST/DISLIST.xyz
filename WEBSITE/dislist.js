var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const chalk = require('chalk');
const fetch = require('node-fetch');
const btoa = require('btoa');
const r = require('rethinkdb');
const uuid = require('uuid');
const crypto = require("crypto-js");
var FormData = require('form-data');

var key = '3250320dcaf3b60f1417b7b37986c4a3';

const CLIENT_ID = '720426204955410454';
const CLIENT_SECRET = 'WwVE2doVri4e7dqJK52HhyiimvxYkzW-';
const redirect = encodeURIComponent('http://localhost/auth');

var port = 80;

app.get('/', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/index.html');});
app.get('/home', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/index.html');});
app.get('/terms', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/terms.html');});
app.get('/auth', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/auth.html');});
app.get('/addserver', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/addserver.html');});
app.get('/dashboard', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/dashboard.html');});

app.use(express.static('PUBLIC'));

app.get('*', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/404.html', 404);});

io.on('connection', (socket) => {
    var address = socket.handshake.address;
    console.log(chalk.grey('[' + chalk.yellow('CONN') + ']User connected on address: ' + chalk.yellow(address.substr(7))));

    //SEND AND RECIEVE BOT DATA
    socket.on('botConn', (data) => {
        console.log('Bot has successfully connected name: ' + data.name);
    });



    //USER AUTHENTICATION
    socket.on('auth', (fragment) => {
        var tokens;
        var userid;
        var creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
        const data = new FormData();
        data.append('client_id', CLIENT_ID);
        data.append('client_secret', CLIENT_SECRET);
        data.append('scope', 'identify email');
        data.append('code', fragment);
        fetch(`https://discord.com/api/oauth2/token?&grant_type=authorization_code&redirect_uri=${redirect}`,
        {
            method: 'POST',
            body: data,
            headers: {
                authorization: `Basic ${creds}`
            }
        }).then(res => res.json())
        .then(info => {
            tokens = info;
            fetch('https://discordapp.com/api/users/@me', {
		        headers: {
			        authorization: `Bearer ${info.access_token}`,
		        },
	        })
            .then(res1 => res1.json())
            .then(apidata => {
                userid = crypto.TripleDES.encrypt(apidata.id, key).toString();
                socket.emit('userdata', userid);
                //CHECK IF THAT USER EXISTS IF NOT ADD THEM IF SO UPDATE THEIR VALUES
                r.table('Users').get(apidata.id).run(global.conn, (err, res) => {
                    if(err)console.log(chalk.red(err));
                    if(res != null){
                        r.table('Users').get(apidata.id).update({
                            id: apidata.id,
                            username: apidata.username,
                            discriminator: apidata.discriminator,
                            avatar: apidata.avatar,
                            email: apidata.email,
                            access_token: tokens.access_token,
                            refresh_token: tokens.refresh_token,
                            token_type: tokens.token_type,
                            scope: tokens.scope
                        }).run(global.conn, (err, res) => {
                            if(err)console.log(chalk.red(err));
                            console.log(chalk.grey('[' + chalk.cyan('DB') + ']User updated in database: ' + chalk.cyan(apidata.username + '#' + apidata.discriminator)));
                        });
                    }else{
                        r.table('Users').insert({
                            id: apidata.id,
                            username: apidata.username,
                            discriminator: apidata.discriminator,
                            avatar: apidata.avatar,
                            email: apidata.email,
                            access_token: tokens.access_token,
                            refresh_token: tokens.refresh_token,
                            token_type: tokens.token_type,
                            scope: tokens.scope,
                            servers: []
                        }).run(global.conn, (err, res) => {
                            if(err)console.log(chalk.red(err));
                            console.log(chalk.grey('[' + chalk.cyan('DB') + ']User added to database: ' + chalk.cyan(apidata.username + '#' + apidata.discriminator)));
                        });
                    }
                });
            })
            .catch(console.error);
        })
        .catch(console.error);
    });


//GET A USERS PROFILE DATA
socket.on('getprofiledata', (data) => {
    var bytes  = crypto.TripleDES.decrypt(data, key);
    var userid = bytes.toString(crypto.enc.Utf8);
    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res){
            fetch('https://discordapp.com/api/users/@me',
            {
                headers: {
                    authorization: `Bearer ${res.access_token}`,
                },
            })
            .then(res1 => res1.json())
            .then(apidata => {
                if(apidata.id === undefined){
                    var creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
                    const data = new FormData();
                    data.append('client_id', CLIENT_ID);
                    data.append('client_secret', CLIENT_SECRET);
                    data.append('scope', 'identify email');
                    data.append('refresh_token', res.refresh_token);
                    fetch(`https://discord.com/api/oauth2/token?&grant_type=refresh_token&redirect_uri=${redirect}`,
                    {
                        headers: {
                            authorization: `Basic ${creds}`
                        },
                    })
                    .then(res1 => res1.json())
                    .then(newtokendata => {
                        fetch('https://discordapp.com/api/users/@me', {
                            headers: {
                                authorization: `Bearer ${newtokendata.access_token}`,
                            },
                        })
                        .then(res1 => res1.json())
                        .then(newuserdata => {
                            r.table('Users').get(res.id).update({
                                id: newuserdata.id,
                                username: newuserdata.username,
                                discriminator: newuserdata.discriminator,
                                avatar: newuserdata.avatar,
                                email: newuserdata.email,
                                access_token: newtokendata.access_token,
                                refresh_token: newtokendata.refresh_token,
                                token_type: newtokendata.token_type,
                                scope: newtokendata.scope
                            }).run(global.conn, (err, res) => {
                                if(err)console.log(chalk.red(err));
                                console.log(chalk.grey('[' + chalk.cyan('DB') + ']User updated in database: ' + chalk.cyan(newuserdata.username + '#' + newuserdata.discriminator)));
                            });
                            r.table('Users').get(res.id)
                            .run(global.conn, (err, res) => {
                                if(err)console.log(chalk.red(err));
                                socket.emit('profileobtained', res);
                            });
                        })
                        .catch(console.error);
                    })
                    .catch(console.error);
                }else{
                    //IT WORKS STILL CARRY THROUGH WITH OPERATION
                    r.table('Users').get(res.id).update({
                        username: apidata.username,
                        discriminator: apidata.discriminator,
                        avatar: apidata.avatar,
                        email: apidata.email
                    }).run(global.conn, (err, res) => {
                        if(err)console.log(chalk.red(err));
                        console.log(chalk.grey('[' + chalk.cyan('DB') + ']User updated in database: ' + chalk.cyan(apidata.username + '#' + apidata.discriminator)));
                    });

                    r.table('Users').get(res.id)
                    .run(global.conn, (err, res) => {
                        if(err)console.log(chalk.red(err));
                        socket.emit('profileobtained', res);
                    });
                }

            })
            .catch(console.error);
        }
    })
});




socket.on('getserverdata', (data) => {
    var bytes  = crypto.TripleDES.decrypt(data, key);
    var userid = bytes.toString(crypto.enc.Utf8);
    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res){
            fetch('https://discordapp.com/api/users/@me/guilds',
            {
                headers: {
                    authorization: `Bearer ${res.access_token}`,
                },
            })
            .then(res1 => res1.json())
            .then(apidata => {
                var ownedServers = [];
                for(i = 0; i < apidata.length; i++){
                    if(apidata[i].owner == true){
                        if(!res.servers.includes(apidata[i].id)){
                            ownedServers.push(apidata[i])
                        }
                    }
                }
                socket.emit('serversobtained', ownedServers);
            })
            .catch(console.error);
        }
    })
});





socket.on('addServer', (data) => {
    var bytes  = crypto.TripleDES.decrypt(data.userID, key);
    var userid = bytes.toString(crypto.enc.Utf8);

    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        var serverList = res.servers;
        if(!serverList.includes(data.serverID)){
            serverList.push(data.serverID);
            r.table('Users').get(userid).update({
                servers: serverList
            }).run(global.conn, (err, res) => {
                if(err)console.log(chalk.red(err));
            });
        }
    });

    r.table('Servers').get(data.serverID).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res == null){
            var date = new Date().getTime();
            r.table('Servers').insert({
                id: data.serverID,
                name: data.serverName,
                icon: data.serverIcon,
                owner: userid,
                premiumTier: 0,
                category: data.category,
                description: data.description,
                tags: data.tags,
                explicit: data.explicit,
                public: false,
                creationDate: date,
                lastBumpTime: date,
                activityLevel: "Low",
                messagesPerHour: 0,
                joinsPerHour: 0,
                leavesPerHour: 0,
                users: 0,
                invite: "",
                rank: 'Bronze',
                rankNum: 0,
                level: 1,
                xp: 0,
                xpNeeded: 100,
                totalMessages: 0,
                totalJoins: 0,
                totalLeaves: 0,
                totalRoles: 0,
                vcUsersPerHour: 0,
                totalChannels: 0
            }).run(global.conn, (err, res) => {
                if(err)console.log(chalk.red(err));
            });
        }
    });
});



socket.on('saveServer', (data) => {
    console.log('works1');
    r.table('Servers').get(data.serverID).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        console.log('works2');
        if(res != null){
            r.table('Servers').get(data.serverID).update({
                name: data.serverName,
                icon: data.serverIcon,
                category: data.category,
                description: data.description,
                tags: data.tags,
                explicit: data.explicit,
                public: data.public
            }).run(global.conn, (err, res) => {
                console.log('works3');
                if(err)console.log(chalk.red(err));
            });
        }
    });
});



socket.on('getMyServers', (data) => {
    var bytes  = crypto.TripleDES.decrypt(data, key);
    var userid = bytes.toString(crypto.enc.Utf8);

    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res != null){
            fetch('https://discordapp.com/api/users/@me/guilds',
            {
                headers: {
                    authorization: `Bearer ${res.access_token}`,
                },
            })
            .then(res1 => res1.json())
            .then(apidata => {
                var ownedServers = [];
                for(i = 0; i < apidata.length; i++){
                    if(apidata[i].owner == true){
                        if(res.servers.includes(apidata[i].id)){
                            ownedServers.push(apidata[i])
                        }
                    }
                }
                ownedServers.forEach(server => {

                    r.table('Servers').get(server.id).run(global.conn, (err, res) => {
                        if(err)console.log(chalk.red(err));

                        if(res != null){
                            r.table('Servers').get(server.id).update({
                                name: server.name,
                                icon: server.icon
                            }).run(global.conn, (err, res) => {
                                if(err)console.log(chalk.red(err));
                            });
                        }

                    });
                });
                
                r.table('Servers').filter({owner: userid}).run(global.conn, (err, res) => {
                    if(err)console.log(chalk.red(err));
                    if(res != null){
                        if(res._responses[0] != undefined){
                            var bumpList = [];
                            for(i = 0; i<res._responses[0].r.length; i++){
                                var lastBump = new Date(res._responses[0].r[i].lastBumpTime);
                                console.log(lastBump);
                                var nextBump = new Date(res._responses[0].r[i].lastBumpTime);
                                nextBump.setHours(nextBump.getHours()+2);
                                console.log(nextBump);
                                var currentDate = new Date();
                                console.log(currentDate);
                                if(currentDate > nextBump){
                                    bumpList.push({bump: true, id: res._responses[0].r[i].id});
                                }else{
                                    var bumpTimer = nextBump.getTime() - currentDate.getTime();
                                    bumpList.push({bump: bumpTimer, id: res._responses[0].r[i].id});
                                }
                            }
                            socket.emit('myServersObtained', res._responses[0].r, bumpList);
                        }
                    }
                });

            })
            .catch(console.error);
        }
    })
});


socket.on('deleteServer', (data) => {
    var bytes  = crypto.TripleDES.decrypt(data.userID, key);
    var userid = bytes.toString(crypto.enc.Utf8);
    r.table('Servers').get(data.server).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res != null){
            r.table('Servers').get(data.server).delete().run(global.conn, (err, res) => {
                if(err)console.log(chalk.red(err));
            });
        }
    });
    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res != null){
            var servers = res.servers;
            var position = res.servers.indexOf(data.server);
            servers.splice(position, 1);
            r.table('Users').get(userid).update({servers: servers}).run(global.conn, (err, res) => {
                if(err)console.log(chalk.red(err));
            });
        }
    });
});


socket.on('bumpServer', (data) => {
    var date = new Date().getTime();
    r.table('Servers').get(data.server).update({lastBumpTime: date}).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
    });
});



});

server.listen(port, () => {

    r.connect({host: 'localhost', port: '28015', db: 'DisList'}, (err, conn) => {
        if(err)console.log(chalk.red(err));
        global.conn = conn;
        console.log(chalk.grey('[' + chalk.cyan('DB') + ']Logged in to Database: ' + chalk.cyan(conn.db) + ' Address: ' + chalk.cyan(conn.host + ':' + conn.port)));
    });

    console.log(chalk.grey('[' + chalk.red('START') + ']Web Server Launched on port: ' + chalk.red(port)));
});