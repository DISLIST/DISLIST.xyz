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
            document.getElementById('navbarNavDropdown').innerHTML += `<div class="btn-group ml-auto bg-transparent" id="profile"><button type="button" class="btn btn-transparent dropdown-toggle bg-transparent" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: white; font-weight: bold; border: 0px; border-color: none;"><img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${extension}" alt="${filterXSS(user.username)}" width="25px" class="rounded-circle my-auto"> ${filterXSS(user.username)}</button><div class="dropdown-menu dropdown-menu-right" style="right:0; left: auto;"><a class="dropdown-item" href="/profile?id=${user.id}"><i class="fas fa-user-astronaut"></i> Profile</a><a class="dropdown-item" href="/dashboard"><i class="fas fa-server"></i> Dashboard</a><div class="dropdown-divider"></div><a class="dropdown-item" href="#" onclick="logout()" style="color: #ff4343;"><i class="fas fa-sign-out-alt"></i> Logout</a></div>`;
        
        });
        socket.emit('getserverdata', window.localStorage.getItem('id'));
        socket.on('serversobtained', (servers) => {
          if(servers.length == 0){
            document.getElementById('serversOwned').innerHTML = `
            <h1>🎉 CONGRATS 🎉</h1>
            <h3 class="mb-5">You've already added all of your servers to DisList.</h3>
            <a href="/dashboard"></div><button type="button" class="btn btn-dark btn-lg"><i class="fas fa-chart-line"></i> View Your Servers</button></a>
            `;
          }else{
            document.getElementById('serversOwned').innerHTML = `<h1>Select Your Server</h1>`;
          }
            serverList = servers;
            var selector = document.getElementById('addServerList');
            for(i = 0; i < servers.length; i++){
                var logourl;
                if(servers[i].icon === null){
                    logourl = '../IMG/dslogo.jpg';
                }else{
                    logourl = `https://cdn.discordapp.com/icons/${serverList[i].id}/${serverList[i].icon}.jpg`;
                }
                selector.innerHTML += `<li class="list-inline-item addServerCard m-2" style=" min-width: 300px; max-width: 300px; color: white;">
                  <div class="m-3">
                    <img src="${logourl}" alt="${filterXSS(serverList[i].name)}" class="rounded-circle pb-3" width="100px">
                    <h4 style="max-height: 30px; overflow: hidden;">${filterXSS(serverList[i].name)}</h4>
                    <button class="btn btn-join" onclick="serverSelected(${i})" type="button"><i class="fas fa-plus"></i> Add Server</button>
                  </div>
              </li>`;
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

var tags = [];

function serverSelected(num){
    var logourl;
    if(serverList[num].icon === null){
        logourl = '../IMG/dslogo.jpg';
    }else{
        logourl = `https://cdn.discordapp.com/icons/${serverList[num].id}/${serverList[num].icon}.jpg`;
    }
    document.getElementById('serverForm').className = "col-sm-4";
    document.getElementById('serverForm').innerHTML = "";
    document.getElementById('serverForm').innerHTML = `<div class="p-4" style="background-color: #333; color: white; border-radius: 10px;">
    <img src="${logourl}" alt="${filterXSS(serverList[num].name)}" class="rounded-circle pb-3" width="150px">
    <h4 style="max-height: 30px; overflow: hidden;">${filterXSS(serverList[num].name)}</h4>
    <h3 class="pt-4" style="text-align: left;">Category <i style="color: rgb(255, 73, 73); font-style: normal;">*</i></h3>
    <select class="form-control selection" id="categorySelect" required>
      <option disabled selected value="no">Select A Category</option>
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
      <textarea class="form-control serverdesc" id="description" placeholder="Server Description" rows="5"></textarea>
    </div>

    <div class="row">
      <div class="col-sm">

      </div>
      <div class="col-sm-4">
        <h4>Explicit <label class="switch">
          <input type="checkbox" id="explicit">
          <span class="slider round"></span>
        </label></h4>
      </div>
      <div class="col-sm-4">
        <h4>Public <label class="switch">
          <input type="checkbox" id="public" checked>
          <span class="slider round"></span>
        </label></h4>
      </div>
      <div class="col-sm">

      </div>
    </div>
    <button type="btn" class="btn btn-join" onclick="addServer(${num})"><i class="fas fa-plus"></i> Add Server</button>
  </div>`;
    var explicit = document.getElementById('explicit').checked;
    var public = document.getElementById('public').checked;

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


}

function addServer(num){
if(document.getElementById('categorySelect').value != 'no'){
  socket.emit('addServer', {
    userID: window.localStorage.getItem('id'),
    serverID: serverList[num].id,
    category: filterXSS(document.getElementById('categorySelect').value),
    tags: tags,
    description: filterXSS(document.getElementById('description').value),
    explicit: document.getElementById('explicit').checked
  });
  window.location.href = '/dashboard';
  var win = window.open(`https://discord.com/oauth2/authorize?client_id=720426204955410454&scope=bot&guild_id=${serverList[num].id}&permissions=19473&redirect_uri=https%3A%2F%2Fdislist.xyz%2F`);
    win.focus();
}
}


function removeTag(name){
  document.getElementById(name).remove();
  var position = tags.indexOf(name);
  tags.splice(position, 1);
}
