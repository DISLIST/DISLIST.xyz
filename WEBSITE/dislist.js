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
const { isMaster } = require('cluster');

var key = '3250320dcaf3b60f1417b7b37986c4a3';

const CLIENT_ID = '720426204955410454';
const CLIENT_SECRET = 'WwVE2doVri4e7dqJK52HhyiimvxYkzW-';
const redirect = encodeURIComponent('https://dislist.xyz/auth');

var port = 80;

app.get('/', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/index.html');});
app.get('/home', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/index.html');});
app.get('/terms', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/terms.html');});
app.get('/auth', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/auth.html');});
app.get('/addserver', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/addserver.html');});
app.get('/dashboard', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/dashboard.html');});
app.get('/leaderboard', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/leaderboard.html');});
app.get('/server', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/server.html');});
app.get('/servers', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/servers.html');});
app.get('/premium', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/premium.html');});
app.get('/profile', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/profile.html');});
app.get('/users', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/users.html');});

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
        data.append('scope', 'identify guilds');
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
                            access_token: tokens.access_token,
                            refresh_token: tokens.refresh_token,
                            token_type: tokens.token_type,
                            scope: tokens.scope
                        }).run(global.conn, (err, res) => {
                            if(err)console.log(chalk.red(err));
                            console.log(chalk.grey('[' + chalk.cyan('DB') + ']User updated in database: ' + chalk.cyan(apidata.username + '#' + apidata.discriminator)));
                        });
                    }else{
                        var date = new Date().getTime();
                        r.table('Users').insert({
                            id: apidata.id,
                            username: apidata.username,
                            discriminator: apidata.discriminator,
                            avatar: apidata.avatar,
                            access_token: tokens.access_token,
                            refresh_token: tokens.refresh_token,
                            token_type: tokens.token_type,
                            scope: tokens.scope,
                            servers: [],
                            banned: false,
                            level: 0,
                            xp: 0,
                            xpNeeded: 100,
                            rank: "Bronze",
                            rankNum: 0,
                            createdAt: date
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


    socket.on('getMyID', (data) => {
        var bytes  = crypto.TripleDES.decrypt(data, key);
        var userid = bytes.toString(crypto.enc.Utf8);
        socket.emit('myID', userid);
    });

    socket.on('getUsers', () => {
        r.table('Users').orderBy(r.desc('level'), r.desc('xp')).limit(50).run(global.conn, (err, res)  => {
            if(err)console.log(chalk.red(err));
            if(res != null){
                var userList = [];
                res.forEach((user) => {
                    userList.push({
                        staffTier: user.staffTier,
                        username: user.username,
                        discriminator: user.discriminator,
                        avatar: user.avatar,
                        level: user.level,
                        xp: user.xp,
                        xpNeeded: user.xpNeeded,
                        rank: user.rank,
                        id: user.id
                    });
                });
                socket.emit('gotUsers', userList);
            }else{
                return;
            }
        });
    });




    socket.on('getUserProfileData', (data) => {
        r.table('Users').get(data.toString()).run(global.conn, (err, res) => {
            if(err)console.log(chalk.red(err));
            if(res != null){
                socket.emit('userProfileDataObtained', {
                    id: res.id,
                    username: res.username,
                    discriminator: res.discriminator,
                    avatar: res.avatar,
                    servers: res.servers,
                    banned: res.banned,
                    level: res.level,
                    xp: res.xp,
                    staffTier: res.staffTier,
                    xpNeeded: res.xpNeeded,
                    rank: res.rank,
                    createdAt: res.createdAt

                });
            }else{
                socket.emit('userProfileDataObtained', false);
            }
        })
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
                    data.append('scope', 'identify guilds');
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


                                //PROBLEM ONLY SEND NECESSARY DATA OVER TO CLIENT AND DO NOT SEND OVER SENSITIVE DATA SUCH AS EMAIL OR TOKENS


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
                        avatar: apidata.avatar
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

socket.on('getServer', (id) => {
    r.table('Servers').get(id).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res != null){
            socket.emit('serverObtained', res);
        }else{
            socket.emit('serverObtained', 'noData');
        }
    });
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
        if(res){
            fetch('https://discordapp.com/api/users/@me/guilds',
            {
                headers: {
                    authorization: `Bearer ${res.access_token}`,
                },
            })
            .then(res1 => res1.json())
            .then(apidata => {
                apidata.forEach(server => {
                    if(server.owner == true){
                        if(server.id == data.serverID){
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
                                    var category;
                                    switch (data.category.toString().toLocaleLowerCase()) {
                                        case 'social':
                                            category = 'Social';
                                            break;
                                        case 'gaming':
                                            category = 'Gaming';
                                            break;
                                        case 'technology':
                                            category = 'Technology';
                                            break;
                                        case 'movies':
                                            category = 'Movies';
                                            break;
                                        case 'art':
                                            category = 'Art';
                                            break;
                                        case 'events':
                                            category = 'Events';
                                            break;
                                        case 'community':
                                            category = 'Community';
                                            break;
                                        default:
                                            category = 'Community';
                                            break;
                                    }
                                    r.table('Servers').insert({
                                        id: server.id,
                                        name: server.name,
                                        icon: server.icon,
                                        owner: userid,
                                        premiumTier: 0,
                                        category: category,
                                        description: data.description,
                                        tags: data.tags,
                                        explicit: data.explicit,
                                        public: false,
                                        bot: false,
                                        creationDate: date,
                                        lastBumpTime: date,
                                        activityLevel: "Low",
                                        messagesPerHour: 0,
                                        joinsPerHour: 0,
                                        leavesPerHour: 0,
                                        users: 0,
                                        invite: "",
                                        banned: false,
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
                        }
                    }
                });
            })
            .catch(console.error);
        }
    })
});



socket.on('saveServer', (data) => {
    var bytes  = crypto.TripleDES.decrypt(data.userID, key);
    var userid = bytes.toString(crypto.enc.Utf8);

    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res){
            if(res.servers.includes(data.serverID)){
                r.table('Servers').get(data.serverID).run(global.conn, (err, res) => {
                    if(err)console.log(chalk.red(err));
                    if(res != null){
                        var category;
                        switch (data.category.toString().toLocaleLowerCase()) {
                            case 'social':
                                category = 'Social';
                                break;
                            case 'gaming':
                                category = 'Gaming';
                                break;
                            case 'technology':
                                category = 'Technology';
                                break;
                            case 'movies':
                                category = 'Movies';
                                break;
                            case 'art':
                                category = 'Art';
                                break;
                            case 'events':
                                category = 'Events';
                                break;
                            case 'community':
                                category = 'Community';
                                break;
                            default:
                                category = 'Community';
                                break;
                        }
                        r.table('Servers').get(data.serverID).update({
                            category: category,
                            description: data.description,
                            tags: data.tags,
                            explicit: data.explicit,
                            public: data.public
                        }).run(global.conn, (err, res) => {
                            if(err)console.log(chalk.red(err));
                        });
                    }
                });
            }
        }
    })
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
                                var nextBump = new Date(res._responses[0].r[i].lastBumpTime);
                                nextBump.setHours(nextBump.getHours()+2);
                                var currentDate = new Date();
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
    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res != null){
            if(res.servers.includes(data.server)){
                var servers = res.servers;
                var position = res.servers.indexOf(data.server);
                servers.splice(position, 1);
                r.table('Users').get(userid).update({servers: servers}).run(global.conn, (err, res) => {
                    if(err)console.log(chalk.red(err));
                });
                r.table('Servers').get(data.server).run(global.conn, (err, res) => {
                    if(err)console.log(chalk.red(err));
                    if(res != null){
                        r.table('Servers').get(data.server).delete().run(global.conn, (err, res) => {
                            if(err)console.log(chalk.red(err));
                        });
                    }
                });
            }
        }
    });
});


socket.on('getCounts', () => {
    r.table('Servers').filter({public: true}).count().run(global.conn, (err, res1) => {
        if(err)console.log(chalk.red(err));
        r.table('Bots').filter({public: true}).count().run(global.conn, (err, res2) => {
            if(err)console.log(chalk.red(err));
            r.table('Templates').count().run(global.conn, (err, res3) => {
                if(err)console.log(chalk.red(err));
                r.table('Users').count().run(global.conn, (err, res4) => {
                    if(err)console.log(chalk.red(err));
                    socket.emit('countsObtained', {serverCount: res1, botCount: res2, templateCount: res3, userCount: res4});
                });
            });
        });
    });
});


socket.on('bumpServer', (data) => {
    var bytes  = crypto.TripleDES.decrypt(data.userID, key);
    var userid = bytes.toString(crypto.enc.Utf8);
    var date = new Date().getTime();
    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res != null){
            if(res.servers.includes(data.server)){
                r.table('Servers').get(data.server).update({lastBumpTime: date}).run(global.conn, (err, res) => {
                    if(err)console.log(chalk.red(err));
                });
            }
        }
    });
});







socket.on('listServers', () => {
    r.table('Servers').filter(r.row('public').eq(true).and(r.row('bot').eq(true))).orderBy(r.desc('lastBumpTime')).limit(6).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        socket.emit('displayServers', res);
    });
});

socket.on('listActiveServers', () => {
    r.table('Servers').orderBy(r.desc('public'), r.desc('level'), r.desc('xp')).limit(6).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        socket.emit('displayActiveServers', res);
    });
});



socket.on('getLeaderboard', () => {
    r.table('Servers').orderBy(r.desc('public'), r.desc('level'), r.desc('xp')).limit(50).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        socket.emit('gotLeaderboard', res);
    });
});



socket.on('verifyIdentity', (data) => {
    var bytes  = crypto.TripleDES.decrypt(data, key);
    var userid = bytes.toString(crypto.enc.Utf8);
    r.table('Users').get(userid).run(global.conn, (err, res) => {
        if(err)console.log(chalk.red(err));
        if(res != null){
            socket.emit('identityVerified', true);
        }else{
            socket.emit('identityVerified', false);
        }
    });
});


socket.on('getServerList', (data) => {
    var category;
    var filter;
    switch (data.filter.toString()) {
        case 'lastBumpTime':
            filter = 'lastBumpTime';
            break;
        case 'level':
            filter = 'level';
        break;
        default:
            filter = 'lastBumpTime';
            break;
    }
    switch (data.category.toString().toLocaleLowerCase()) {
        case 'social':
            category = 'Social';
            break;
        case 'gaming':
            category = 'Gaming';
            break;
        case 'technology':
            category = 'Technology';
            break;
        case 'movies':
            category = 'Movies';
            break;
        case 'art':
            category = 'Art';
            break;
        case 'events':
            category = 'Events';
            break;
        case 'community':
            category = 'Community';
            break;
        default:
            category = 'lastBumpTime';
            break;
    }
    if(category == 'lastBumpTime'){
        r.table('Servers').filter({public: true}).orderBy(r.desc(filter)).run(global.conn, (err, res) => {
            if(err)console.log(chalk.red(err));
            socket.emit('serverListObtained', res);
        })
    }else{
        r.table('Servers').filter({public: true}).orderBy(r.desc(filter)).filter({category: category}).run(global.conn, (err, res) => {
            if(err)console.log(chalk.red(err));
            socket.emit('serverListObtained', res);
        })
    }
});


});

server.listen(port, () => {

    r.connect({host: 'localhost', port: '28015', db: 'DisList'}, (err, conn) => {
        if(err)console.log(chalk.red(err));
        global.conn = conn;
        console.log(chalk.grey('[' + chalk.cyan('DB') + ']Logged in to Database: ' + chalk.cyan(global.conn.db) + ' Address: ' + chalk.cyan(conn.host + ':' + conn.port)));
    });

    console.log(chalk.grey('[' + chalk.red('START') + ']Web Server Launched on port: ' + chalk.red(port)));
});