const socket = io.connect('https://dislist.xyz/');

var guild;
var profile;

function load(){


    if(window.localStorage.getItem('id') != null){
      socket.emit('verifyIdentity', window.localStorage.getItem('id'));
      socket.on('identityVerified', (data) => {
        if(data == false){
          logout();
        }
      });
        socket.emit('getprofiledata', window.localStorage.getItem('id'));
        socket.on('profileobtained', (user) => {
            var extension;
            if(user.avatar.toString().includes('a_')){
                extension = '.gif';
            }else{
                extension = '.jpg';
            }
            document.getElementById('navbarNavDropdown').innerHTML += `
            <div class="btn-group ml-auto bg-transparent" id="profile">
            <button type="button" class="btn btn-transparent dropdown-toggle bg-transparent" data-toggle="dropdown" data-target="#profile" aria-haspopup="true" aria-expanded="false" style="color: white; font-weight: bold; border: 0px; border-color: none;">
            <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${extension}" alt="${filterXSS(user.username)}" width="25px" class="rounded-circle my-auto">
             ${filterXSS(user.username)}
             </button>
             <div class="dropdown-menu dropdown-menu-right" style="right:0; left: auto;">
             <a class="dropdown-item" href="/profile?id=${user.id}">
             <i class="fas fa-user-astronaut"></i> Profile
             </a>
             <a class="dropdown-item" href="/dashboard">
             <i class="fas fa-server">
             </i> Dashboard</a>
             <div class="dropdown-divider"></div>
             <a class="dropdown-item" href="#" onclick="logout()" style="color: #ff4343;">
             <i class="fas fa-sign-out-alt">
             </i> Logout</a>
             </div>
             </div>
            

             <div class="btn-group bg-transparent" id="add">

  <button type="button" class="btn btn-add dropdown-toggle" data-toggle="dropdown" data-target="#add" aria-haspopup="true" aria-expanded="false"><i class="fas fa-plus"></i> Add</button>
  <div class="dropdown-menu dropdown-menu-right" style="right:0; left: auto;">
  <a class="dropdown-item" href="/addserver"><i class="fas fa-server"></i> Add Server</a>
  <a class="dropdown-item" href="/addbot"><i class="fas fa-robot"></i> Add Bot</a>
  <a class="dropdown-item" href="/addtemplate"><i class="fas fa-book"></i> Add Template</a>
  </div>
  </div>
            `;
          });
    }else{
        document.getElementById('navbarNavDropdown').innerHTML += '<a href="https://discord.com/oauth2/authorize?client_id=720426204955410454&redirect_uri=https%3A%2F%2Fdislist.xyz%2Fauth&response_type=code&scope=identify%20guilds"><button type="button" class="btn btn-add ml-auto"><i class="fab fa-discord"></i> Login via Discord</button></a>';
    }

    var params = (new URL(document.location)).searchParams;
    if(params.get('id') != null){
      if(window.localStorage.getItem('id') != null){
        socket.emit('getMyID', window.localStorage.getItem('id'));
        socket.on('myID', (data) => {
          profile = data;
        });
      }else{
        profile = null;
      }
      socket.emit('getServer', params.get('id'));
      socket.on('serverObtained', (server) => {
        if(server != 'noData'){
        guild = server;
        var logourl;
              if(guild.icon === null){
                  logourl = '../IMG/dslogo.jpg';
              }else{
                  logourl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.jpg`;
              }

              if(parseInt((guild.xp / guild.xpNeeded) * 100) <= 5){
                var progressColor = 'color: white;'
              }else{
                var progressColor = 'color: #333;'
              }
              var date = new Date(guild.lastBumpTime);
              var date2 = new Date(guild.creationDate);



      //HTML TYPES
      var ownerDesign = `
      <div class="p-3 mb-3" style="background-color: #ff4747; border-radius: 10px; color: white;"><p style="background-color: #222; color: white; border-radius: 5px;">THIS SERVER IS PRIVATE BUT YOU OWN IT SO YOU CAN SEE IT.<p</div>
      <div class="p-5" style="background-color: #222; border-radius: 10px;">
          <img src="${logourl}" alt="${filterXSS(guild.name)}" width="100px" class="mb-3 rounded-circle">
          <h4><i class="fas fa-users"></i> ${guild.users}</h4>
          <h1>${filterXSS(guild.name)}</h1>
          <h3 class="mb-5"><kbd style="background-color: #F5CB5C; color: #333;">${guild.category}</kbd></h3>

          <div class="row">
          <div class="col-sm-3 mt-3">
          <h3>Rank</h3>
          <img src="../IMG/${guild.rank}.svg" alt="${filterXSS(guild.rank)}" width="40px">
          <h4>${guild.rank}</h4>
          </div>
          <div class="col-sm"></div>
          <div class="col-sm-3 mt-3">
          <h3>Level</h3>
          <h4> Lvl ${guild.level.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<h4>
                    <h6>Xp: ${parseInt(guild.xp).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} / ${parseInt(guild.xpNeeded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h6>
                      <div class="progress" style="background-color: #444;">
                        <div class="progress-bar bg-warning" role="progressbar" style="font-weight: bold; ${progressColor} !important; width: ${parseInt((guild.xp / guild.xpNeeded) * 100)}%;" aria-valuenow="${parseInt((guild.xp / guild.xpNeeded) * 100)}" aria-valuemin="0" aria-valuemax="100">${parseInt((guild.xp / guild.xpNeeded) * 100)}%</div>
                      </div>
          </div>
          <div class="col-sm"></div>
          <div class="col-sm-3 mt-3">
          <h3>Last Bump</h3>
          <h4>${date.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}</h4>
          </div>
          </div>

          <div class="row mb-3">
          <div class="col-sm-3 mt-3">
          <h3>Channels</h3>
          <h4><i class="fas fa-user-circle"></i> ${guild.totalChannels}</h4>
          </div>
          <div class="col-sm"></div>
          <div class="col-sm-3 mt-3">
          <h3>Roles</h3>
          <h4><i class="fas fa-user-edit"></i> ${guild.totalRoles}</h4>
          </div>
          <div class="col-sm"></div>
          <div class="col-sm-3 mt-3">
          <h3>Posted On</h3>
          <h4>${date2.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}</h4>
          </div>
          </div>




          <h3 style="text-align: left;">Tags:</h3>
          <ul class="list-inline" id="tagList" style="text-align: left;"></ul>
          <h3 style="text-align: left;">Description:</h3>
          <textarea disabled class="serverdesc1 mb-3 p-3" rows="10">${filterXSS(guild.description)}</textarea>
          <button class="btn btn-join" type="button" onclick="joinServer()" ><i class="fas fa-sign-in-alt"></i> Join</button>
        </div>
      `;


      var publicDesign = `
      <div class="p-5" style="background-color: #222; border-radius: 10px;">
          <img src="${logourl}" alt="${filterXSS(guild.name)}" width="100px" class="mb-3 rounded-circle">
          <h4><i class="fas fa-users"></i> ${guild.users.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
          <h1>${filterXSS(guild.name)}</h1>
          <h3 class="mb-5"><kbd style="background-color: #F5CB5C; color: #333;">${guild.category}</kbd></h3>
          

          <div class="row">
          <div class="col-sm-3 mt-3">
          <h3>Rank</h3>
          <img src="../IMG/${guild.rank}.svg" alt="${guild.rank}" width="40px">
          <h4>${guild.rank}</h4>
          </div>
          <div class="col-sm"></div>
          <div class="col-sm-3 mt-3">
          <h3>Level</h3>
          <h4> Lvl ${guild.level.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<h4>
                    <h6>Xp: ${xpParse(guild.xp)} / ${xpParse(guild.xpNeeded)}</h6>
                      <div class="progress" style="background-color: #444;">
                        <div class="progress-bar bg-warning" role="progressbar" style="font-weight: bold; ${progressColor} !important; width: ${parseInt((guild.xp / guild.xpNeeded) * 100)}%;" aria-valuenow="${parseInt((guild.xp / guild.xpNeeded) * 100)}" aria-valuemin="0" aria-valuemax="100">${parseInt((guild.xp / guild.xpNeeded) * 100)}%</div>
                      </div>
          </div>
          <div class="col-sm"></div>
          <div class="col-sm-3 mt-3">
          <h3>Last Bump</h3>
          <h4>${date.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}</h4>
          </div>
          </div>

          <div class="row mb-3">
          <div class="col-sm-3 mt-3">
          <h3>Channels</h3>
          <h4><i class="fas fa-user-circle"></i> ${guild.totalChannels}</h4>
          </div>
          <div class="col-sm"></div>
          <div class="col-sm-3 mt-3">
          <h3>Roles</h3>
          <h4><i class="fas fa-user-edit"></i> ${guild.totalRoles}</h4>
          </div>
          <div class="col-sm"></div>
          <div class="col-sm-3 mt-3">
          <h3>Posted On</h3>
          <h4>${date2.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}</h4>
          </div>
          </div>


          <h3 style="text-align: left;">Tags:</h3>
          <ul class="list-inline" id="tagList" style="text-align: left;"></ul>
          <h3 style="text-align: left;">Description:</h3>
          <textarea disabled class="serverdesc1 mb-3 p-3" rows="10">${filterXSS(guild.description)}</textarea>
          <button class="btn btn-join" type="button" onclick="joinServer()" ><i class="fas fa-sign-in-alt"></i> Join</button>
        </div>
      `;





        if(guild.public == true){
          document.getElementById('serverCard').innerHTML = publicDesign;
          for(i = 0; i< guild.tags.length; i++){
            document.getElementById("tagList").innerHTML += `<li class="list-inline-item m-2" id="${filterXSS(guild.tags[i])}"><span class="label label-tag">${filterXSS(guild.tags[i])}</span></li>`;
          }



          var link = document.createElement('meta');
          link.setAttribute('name', 'description');
          link.content = guild.description;
          document.getElementsByTagName('head')[0].appendChild(link);
          var link1 = document.createElement('meta');
          link1.setAttribute('property', 'og:title');
          link1.content = guild.name + ' | DISLIST: Discord Server List | A Public Discord Server List';
          document.getElementsByTagName('head')[0].appendChild(link1);
          var link2 = document.createElement('meta');
          link2.setAttribute('property', 'og:description');
          link2.content = guild.description;
          document.getElementsByTagName('head')[0].appendChild(link2);
          var link3 = document.createElement('meta');
          link3.setAttribute('property', 'og:url');
          link3.content = document.location;
          document.getElementsByTagName('head')[0].appendChild(link3);
          var link4 = document.createElement('title');
          link4.innerText = guild.name + ' | DISLIST: Discord Server List | A Public Discord Server List';
          document.getElementsByTagName('head')[0].appendChild(link4);





        }else{
          if(profile != null){
            if(guild.owner == profile){
              document.getElementById('serverCard').innerHTML = ownerDesign;
              for(i = 0; i< guild.tags.length; i++){
                document.getElementById("tagList").innerHTML += `<li class="list-inline-item m-2" id="${filterXSS(guild.tags[i])}"><span class="label label-tag">${filterXSS(guild.tags[i])}</span></li>`;
              }






              var link = document.createElement('meta');
          link.setAttribute('name', 'description');
          link.content = guild.description;
          document.getElementsByTagName('head')[0].appendChild(link);
          var link1 = document.createElement('meta');
          link1.setAttribute('property', 'og:title');
          link1.content = guild.name + ' | DISLIST: Discord Server List | A Public Discord Server List';
          document.getElementsByTagName('head')[0].appendChild(link1);
          var link2 = document.createElement('meta');
          link2.setAttribute('property', 'og:description');
          link2.content = guild.description;
          document.getElementsByTagName('head')[0].appendChild(link2);
          var link3 = document.createElement('meta');
          link3.setAttribute('property', 'og:url');
          link3.content = document.location;
          document.getElementsByTagName('head')[0].appendChild(link3);
          var link4 = document.createElement('title');
          link4.innerText = guild.name + ' | DISLIST: Discord Server List | A Public Discord Server List';
          document.getElementsByTagName('head')[0].appendChild(link4);




            }else{
              window.location.href = '/';
            }
          }else{
            window.location.href = '/';
          }
        }
      }else{
        window.location.href = '/';
      }
      });
    }else{
      window.location.href = '/';
    }

    console.log('%c HEY YOU SHOULDNT BE HERE', 'color: #F5CB5C; font-size: 50px;');
    console.log('%c Would you kindly not look at our source?', 'color: #F5CB5C; font-size: 25px;');
    console.log('%c Unless of course an official DisList staff member asked you to go in here.', 'color: #F5CB5C; font-size: 25px;');
}

function logout(){
    window.localStorage.removeItem('id');
    window.location.href = '/';
}


function joinServer(){
    window.open(guild.invite.toString());
}


function xpParse (value) {
  var suffixes = ["", "k", "m", "b","t"];
  var suffixNum = Math.floor((""+value).length/3);
  var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(3));
  if (shortValue % 1 != 0) {
      shortValue = shortValue.toFixed(1);
  }
  return shortValue+suffixes[suffixNum];
}