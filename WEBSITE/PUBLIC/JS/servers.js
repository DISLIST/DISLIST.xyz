const socket = io.connect('https://dislist.xyz/');

var serverList;
var activeList;

function load(){
  socket.emit('getCounts');
  setInterval(() => {
    socket.emit('getCounts');
  }, 10000);
  socket.on('countsObtained', (data) => {
    document.getElementById('serverCount').innerHTML = `
    <h4>${data.serverCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<i style="font-style: normal; font-weight: 300;"> SERVERS IN TOTAL</i></h4>
    `;
  })
  var search = document.getElementById('Search');
search.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    if(search.value.toString() != null && search.value.toString() != ''){
      submit();
    }
  }
}); 
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
      if(params.get('filter') != null){
        var filter = params.get('filter')
        switch (params.get('filter').toLocaleLowerCase()) {
          case 'level':
            document.getElementById('filterSelect').value='level';
            break;
            case 'lastbumptime':
              document.getElementById('filterSelect').value='lastBumpTime';
              break;
          default:
            document.getElementById('filterSelect').value='lastBumpTime';
            break;
        }
      }else{
        var filter = 'lastBumpTime';
        document.getElementById('filterSelect').value='lastBumpTime';
      }




      if(params.get('category') != null){
        var category = params.get('category')
        switch (params.get('category').toLocaleLowerCase()) {
          case 'social':
            document.getElementById('categorySelect').value='Social';
            break;
            case 'gaming':
            document.getElementById('categorySelect').value='Gaming';
            break;
            case 'technology':
            document.getElementById('categorySelect').value='Technology';
            break;
            case 'movies':
            document.getElementById('categorySelect').value='Movies';
            break;
            case 'art':
            document.getElementById('categorySelect').value='Art';
            break;
            case 'events':
            document.getElementById('categorySelect').value='Events';
            break;
            case 'community':
            document.getElementById('categorySelect').value='Community';
            break;
        
          default:
            document.getElementById('categorySelect').value='no';
            break;
        }
      }else{
        var category = 'lastBumpTime';
        document.getElementById('categorySelect').value='no';
      }

    socket.emit('getServerList', ({ filter: filter, category: category}));




        socket.on('serverListObtained', (data) => {
            serverList = data;
            for(i = 0; i < data.length; i++){
                if(serverList[i].public == true){
                  if(parseInt((serverList[i].xp / serverList[i].xpNeeded) * 100) <= 5){
                    var progressColor = 'color: white;'
                  }else{
                    var progressColor = 'color: #333;'
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
                            <kbd style="background-color: aqua; font-size: small; color: #333;">Premium</kbd>
                        </li>`;
                        var border = 'border: 5px solid aqua;';
                        break;
                    case 2:
                        premiumLevel = `
                        <li class="list-inline-item m-1">
                            <kbd style="background-color: aqua; font-size: small; color: #333;">Premium+</kbd>
                        </li>`;
                        var border = 'border: 5px solid aqua;';
                        break;
                    case 3:
                        premiumLevel = `
                        <li class="list-inline-item m-1">
                            <kbd style="background-color: aqua; font-size: small; color: #333;">Premium++</kbd>
                        </li>`;
                        var border = 'border: 5px solid aqua;';
                        break;
                }
                if(serverList[i].icon === null){
                    logourl = '../IMG/dslogo.jpg';
                }else{
                    logourl = `https://cdn.discordapp.com/icons/${serverList[i].id}/${serverList[i].icon}.jpg`;
                }
                document.getElementById('serverList').innerHTML += `
                <li class="list-inline-item m-2" style="max-width: 500px; ${border}">
              <a class="servercard" href="/server?id=${serverList[i].id}">
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
                    <img src="../IMG/${serverList[i].rank}.svg" alt="${serverList[i].rank}" width="40px">
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
                  <button class="btn btn-join" type="button" onclick="joinServer(${i})" ><i class="fas fa-sign-in-alt"></i> Join</button>
                  </div>
                </div>
              </div>
            </li>
                `;
            };
            };
        });

    console.log('%c HEY YOU SHOULDNT BE HERE', 'color: #F5CB5C; font-size: 50px;');
    console.log('%c Would you kindly not look at our source?', 'color: #F5CB5C; font-size: 25px;');
    console.log('%c Unless of course an official DisList staff member asked you to go in here.', 'color: #F5CB5C; font-size: 25px;');
}

function joinServer(i){
    window.open(serverList[i].invite);
}

function logout(){
    window.localStorage.removeItem('id');
    window.location.href = '/';
}


function filter(){
  var filter = document.getElementById('filterSelect').value;
  var category = document.getElementById('categorySelect').value;
  if(category != 'no'){
    window.location.href= `/servers?filter=${filter}&category=${category}`;
  }else{
    window.location.href= `/servers?filter=${filter}`;
  }
}

function submit(){
  var search = document.getElementById('Search');
  window.location.href = `/search?keyword=${search.value.toString()}`
}

function addYourServer(){
  if(window.localStorage.getItem('id') != null){
    window.location.href = '/addserver';
  }else{
    window.location.href = 'https://discord.com/oauth2/authorize?client_id=720426204955410454&redirect_uri=https%3A%2F%2Fdislist.xyz%2Fauth&response_type=code&scope=identify%20guilds';
  }
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