const socket = io.connect('https://dislist.xyz/');

var serverList;


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
        socket.emit('getMyServers', window.localStorage.getItem('id'));
        socket.on('myServersObtained', (data, data2) => {
          serverList = data;
            if(data.length >= 1){
                document.getElementById('serverMsg').innerHTML = `
                <h1 class="p-5">Your Servers</h1>
                `;
            }
            for(i = 0; i < data.length; i++){
                if(serverList[i].bot == false){
                    var disabled = "disabled";
                    var privateServer = `
                    <div class="bg-danger p-2" style="width: 100%; border-radius: 5px; border-bottom-left-radius: 0px; border-bottom-right-radius: 0px;">
                        <h6>You must add the bot and give it the permissions.</h6>
                        <p><kbd>CREATE_INSTANT_INVITE</kbd> and <kbd>SEND_MESSAGES</kbd></p>
                        <p>Then type <kbd>]invite</kbd></p>
                        <button class="btn btn-join" onclick="addBot(${i})" type="button"><i class="fas fa-robot"></i> Add Bot</button>
                    </div>
                    `;
                }else{
                  var disabled = '';
                  var privateServer = ``;
                }
                if(parseInt((serverList[i].xp / serverList[i].xpNeeded) * 100) <= 5){
                  var progressColor = 'color: white;'
                }else{
                  var progressColor = 'color: #333;'
                }
                if(data2[i].bump == true){
                  var bumpBtn = `
                  <div class="col-sm">
                      <button class="btn btn-bump m-1" type="button" id="${serverList[i].id}" onclick="bumpServer(${i})" ${disabled}><i class="fas fa-chevron-up"></i> Bump</button>
                    </div>
                  `;
                }else{
                  var bumpBtn = `
                  <div class="col-sm">
                      <button class="btn btn-bump m-1" type="button" id="${serverList[i].id}" onclick="bumpFailed()" disabled><i class="fas fa-chevron-up"></i> Bump</button>
                    </div>
                  `;
                  var bumpTimer = data2[i].bump;
                  startTimer(i, bumpTimer);
                }
                var logourl;
                var explicitContent;
                var publicContent;
                var premiumLevel;
                if(serverList[i].explicit == true){
                    explicitContent = `<li class="list-inline-item m-1">
                    <kbd style="background-color: rgb(255, 97, 97); color: #333;">Explicit</kbd>
                  </li>`;
                }else{
                    explicitContent = ``;
                }
                if(serverList[i].public == true){
                    publicContent = `<li class="list-inline-item m-1">
                    <kbd style="background-color: rgb(47, 255, 92); font-size: small; color: #333;">Public</kbd>
                  </li>`;
                }else{
                    publicContent = `<li class="list-inline-item m-1">
                    <kbd style="background-color: rgb(255, 97, 97); font-size: small; color: white;">Private</kbd>
                  </li>`;
                }
                switch (serverList[i].premiumTier) {
                    case 0:
                        premiumLevel = `
                        <li class="list-inline-item2 m-1">
                          <kbd style="background-color: transparent; font-size: small;">⠀⠀⠀⠀⠀⠀⠀⠀</kbd>
                        </li>`;
                        var border = '';
                        break;
                    case 1:
                        premiumLevel = `
                        <li class="list-inline-item m-1">
                            <kbd style="background-color: rgb(0, 255, 255); font-size: small; color: #333;">Premium</kbd>
                        </li>`;
                        var border = 'border: 5px solid aqua;';
                        break;
                    case 2:
                        premiumLevel = `
                        <li class="list-inline-item m-1">
                            <kbd style="background-color: rgb(0, 255, 255); font-size: small; color: #333;">Premium+</kbd>
                        </li>`;
                        var border = 'border: 5px solid aqua;';
                        break;
                    case 3:
                        premiumLevel = `
                        <li class="list-inline-item m-1">
                            <kbd style="background-color: rgb(0, 255, 255); font-size: small; color: #333;">Premium++</kbd>
                        </li>`;
                        var border = 'border: 5px solid aqua;';
                        break;
                }
                if(serverList[i].icon === null){
                    logourl = '../IMG/dslogo.jpg';
                }else{
                    logourl = `https://cdn.discordapp.com/icons/${serverList[i].id}/${serverList[i].icon}.jpg`;
                }
                document.getElementById('yourServers').innerHTML += `
                <li class="list-inline-item m-2" style="max-width: 500px; ${border}">
                <a class="servercard" href="/server?id=${serverList[i].id}">
              ${privateServer}
                <div class="m-3">
                  <div class="row">
                    <div class="col-sm-3 my-auto">
                      <img src="${logourl}" alt="${filterXSS(serverList[i].name)}" class="rounded-circle" width="90px">
                    </div>
                    <div class="col-sm-5 my-auto" style="text-align: left;">
                    <h4 style="max-height: 30px; overflow: hidden;">${filterXSS(serverList[i].name)}</h4>
                      <h6><i class="fas fa-users"></i> ${serverList[i].users.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h6>
                      <ul class="list-inline">
                        <li class="list-inline-item m-1">
                          <kbd style="background-color: #ffbb00; color: #333;">${serverList[i].category}</kbd>
                        </li>
                        ${explicitContent}
                        ${publicContent}
                        ${premiumLevel}
                      </ul>
                    </div>
                    <div class="col-sm-4 my-auto">
                    <img src="../IMG/${serverList[i].rank}.svg" alt="${filterXSS(serverList[i].rank)}" width="40px">
                    <h4> Lvl ${serverList[i].level.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<h4>
                    <h6>Xp: ${xpParse(serverList[i].xp)} / ${xpParse(serverList[i].xpNeeded)}</h6>
                      <div class="progress" style="background-color: #444;">
                        <div class="progress-bar bg-warning" role="progressbar" style="font-weight: bold; ${progressColor} !important; width: ${parseInt((serverList[i].xp / serverList[i].xpNeeded) * 100)}%;" aria-valuenow="${parseInt((serverList[i].xp / serverList[i].xpNeeded) * 100)}" aria-valuemin="0" aria-valuemax="100">${parseInt((serverList[i].xp / serverList[i].xpNeeded) * 100)}%</div>
                      </div>
                    </div>
                  </div>
                  <div style="text-align: left;">
                  <h6 class="pt-4">Description:</h6>
                  <textarea disabled class="serverdesc1 mb-3">${filterXSS(serverList[i].description)}</textarea>
                  </div>
                </div>
              </a>
              <div class="m-3">
                <div class="row">
                  <div class="col-sm">
                    <button class="btn btn-join m-1" type="button" ${disabled} onclick="editServer(${i})" data-toggle="modal" data-target=".bd-example-modal-lg"><i class="fas fa-sign-in-alt"></i> Edit</button>
                  </div>
                  ${bumpBtn}
                  <div class="col-sm">
                    <button class="btn btn-delete m-1" onclick="deleteServer(${i})" type="button"><i class="fas fa-skull"></i> Delete</button>
                  </div>
                </div>
              </div>
            </li>
                `;
            };
        });
    }else{
        window.location.href = '/';
    }
    console.log('%c HEY YOU SHOULDNT BE HERE', 'color: #F5CB5C; font-size: 50px;');
    console.log('%c Would you kindly not look at our source?', 'color: #F5CB5C; font-size: 25px;');
    console.log('%c Unless of course an official DisList staff member asked you to go in here.', 'color: #F5CB5C; font-size: 25px;');
}

function deleteServer(num){
    socket.emit('deleteServer', {server: serverList[num].id, userID: window.localStorage.getItem('id')});
    window.location.href = '/dashboard';
}

function bumpServer(num){
    socket.emit('bumpServer', {server: serverList[num].id, userID: window.localStorage.getItem('id')});
    window.location.href = '/dashboard';
}

function startTimer(i, bumpTimer) {
  setInterval(() => {
    var serverList2 = serverList;
    if(bumpTimer > 0){
      x = parseInt(bumpTimer) / 1000;
    seconds = x % 60;
    x /= 60;
    minutes = x % 60;
    x /= 60;
    hours = x % 24;
    if(seconds < 10){
      second0 = 0;
    }else{
      second0 = '';
    }
    if(minutes < 10){
      minute0 = 0;
    }else{
      minute0 = '';
    }
    if(hours < 10){
      hour0 = 0;
    }else{
      hour0 = '';
    }
    document.getElementById(`${serverList2[i].id}`).innerHTML = `<i class="fas fa-stopwatch"></i> ${hour0}${parseInt(hours)}:${minute0}${parseInt(minutes)}:${second0}${parseInt(seconds)}`;
    bumpTimer = bumpTimer-1000;
    }else{
      window.location.href = '/dashboard';
    }
  }, 1000);
}

function logout(){
    window.localStorage.removeItem('id');
    window.location.href = '/';
}

function addBot(num){
    var win = window.open(`https://discord.com/oauth2/authorize?client_id=720426204955410454&scope=bot&guild_id=${serverList[num].id}&permissions=19473&redirect_uri=https%3A%2F%2Fdislist.xyz%2F`, '_blank');
    win.focus();
}

var tags = [];

function editServer(i){
  tags = serverList[i].tags;
  if(serverList[i].icon === null){
    logourl = '../IMG/dslogo.jpg';
}else{
    logourl = `https://cdn.discordapp.com/icons/${serverList[i].id}/${serverList[i].icon}.jpg`;
}
if(serverList[i].explicit == true){
  var explicitCheck = 'checked';
}else{
  var explicitCheck = '';
}

if(serverList[i].public == true){
  var publicCheck = 'checked';
}else{
  var publicCheck = '';
}
  document.getElementById('modalContent').innerHTML = `
  <div class="modal-content" style="background-color: #333;">
      <div class="modal-header" style="border: 0px;">
        <h5 class="modal-title">EDITING SERVER</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="color: white; border: 0px;">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" style="border: 0px;">
        <img src="${logourl}" alt="${filterXSS(serverList[i].name)}" class="rounded-circle pb-3" width="100px">
        <img src="../IMG/${serverList[i].rank}.svg" alt="${filterXSS(serverList[i].rank)}" width="50px" style="z-index: 12; position: absolute; left: 317px; top: 13px;">
        <h4 style="max-height: 30px; overflow: hidden;">${filterXSS(serverList[i].name)}</h4>
    <h3 class="pt-4" style="text-align: left;">Category <i style="color: rgb(255, 73, 73); font-style: normal;">*</i></h3>
    <select class="form-control selection" id="categorySelect" required>
      <option value="Social">Social</option>
      <option value="Gaming">Gaming</option>
      <option value="Technology">Technology</option>
      <option value="Movies">Movies</option>
      <option value="Art">Art</option>
      <option value="Events">Events</option>
      <option value="Community">Community</option>
    </select>
    <h3 class="pt-4" style="text-align: left;">Tags</h3>
    <div class="form-group">
      <input type="text" class="form-control selection" id="tagArea" placeholder="Add Tags">
    </div>
    <div class="pt-2" style="text-align: left;">
      <ul class="list-inline" id="tagList"></ul>
      <p>- You can add up to 5 tags.</p>
      <p>- Make sure they're keywords that would make your server searchable.</p>
    </div>
    <h3 class="pt-3" style="text-align: left;">Description</h3>
    <div class="form-group" style="text-align: left;">
      <textarea class="form-control serverdesc" id="description" placeholder="Server Description" rows="3">${filterXSS(serverList[i].description)}</textarea>
    </div>

    <div class="row">
      <div class="col-sm">

      </div>
      <div class="col-sm-4">
        <h4>Explicit <label class="switch">
          <input type="checkbox" id="explicit" ${explicitCheck}>
          <span class="slider round"></span>
        </label></h4>
      </div>
      <div class="col-sm-4">
        <h4>Public <label class="switch">
          <input type="checkbox" id="public" ${publicCheck}>
          <span class="slider round"></span>
        </label></h4>
      </div>
      <div class="col-sm">

      </div>
    </div>
      </div>
      <div class="modal-footer" style="border: 0px;">
        <button type="button" onclick="saveServer(${i})" class="btn btn-join">Save changes</button>
      </div>
    </div>
  `;

  document.getElementById('categorySelect').value=`${serverList[i].category}`;

  var input = document.getElementById("tagArea");

    input.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            if(input.value != ''){
              if(tags.length < 5 && !tags.includes(filterXSS(input.value))){
                document.getElementById("tagList").innerHTML += `<li class="list-inline-item m-2" id="${filterXSS(input.value)}"><span class="label label-tag">${filterXSS(input.value)}<button type="button" onclick="removeTag('${filterXSS(input.value)}')" class="btn btn-danger btn-sm ml-1">X</button></span></li>`;
                   tags.push(filterXSS(input.value));
                   input.value = "";
               }
            }
            input.value = "";
        }
    }); 


    for(i = 0; i< tags.length; i++){
      document.getElementById("tagList").innerHTML += `<li class="list-inline-item m-2" id="${tags[i]}"><span class="label label-tag">${tags[i]}<button type="button" onclick="removeTag('${tags[i]}')" class="btn btn-danger btn-sm ml-1">X</button></span></li>`;
    }

    
}

function saveServer(num){
    socket.emit('saveServer', {
      userID: window.localStorage.getItem('id'),
      serverID: serverList[num].id,
      category: filterXSS(document.getElementById('categorySelect').value),
      tags: tags,
      description: filterXSS(document.getElementById('description').value),
      explicit: document.getElementById('explicit').checked,
      public: document.getElementById('public').checked
    });
    window.location.href = `/dashboard`;
  }


function removeTag(name){
  document.getElementById(name).remove();
  var position = tags.indexOf(name);
  tags.splice(position, 1);
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

