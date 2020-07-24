const socket = io.connect('https://dislist.xyz/');

var userList;

function load(){
  socket.emit('getCounts');
  setInterval(() => {
    socket.emit('getCounts');
  }, 10000);
  socket.on('countsObtained', (data) => {
    document.getElementById('userCount').innerHTML = `
    <h4>${data.userCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<i style="font-style: normal; font-weight: 300;"> USERS IN TOTAL</i></h4>
    `;
  })
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

    var search = document.getElementById('search');
search.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    if(search.value.toString() != null && search.value.toString() != ''){
        window.location.href=`/profile?id=${search.value.toString()}`
    }
  }
}); 


    socket.emit('getUsers');
    socket.on('gotUsers', (data) => {
        userList = data;
        for(i = 0; i < data.length; i++){

          switch (userList[i].staffTier) {
            case 0:
              var verified = ``;
              break;
            case 1: 
              var verified = ` <i class="fas fa-check-circle" style="color: #F5CB5C"></i>`;
              break;
            case 2: 
              var verified = ` <i class="fas fa-check-circle" style="color: #F5CB5C"></i>`;
              break;
            case 3: 
              var verified = ` <i class="fas fa-check-circle" style="color: #F5CB5C"></i>`;
              break;
            default:
              var verified = ``;
              break;
          }
            var logourl;
           var extension1;
            if(userList[i].avatar === null){
                logourl = '../IMG/dslogo.jpg';
            }else{
              if(userList[i].avatar.toString().includes('a_')){
                extension1 = '.gif';
            }else{
                extension1 = '.jpg';
            }
              logourl = `https://cdn.discordapp.com/avatars/${userList[i].id}/${userList[i].avatar}${extension1}`;
            }
            document.getElementById('users').innerHTML += `
            <li class="list-item mb-3">
            <a class="servercard" href="/profile?id=${userList[i].id}">
      <div class="container-fluid">
        <div class="row my-auto">
          <div class="col-sm-1 my-auto">
            <h3 class="my-auto">${i+1}</h3>
          </div>
          <div class="col-sm-1 my-auto mx-auto">
            <img src="${logourl}" alt="${filterXSS(userList[i].username)}" class="rounded-circle mx-auto" width="75px">
          </div>
          <div class="col-sm-4 my-auto" style="text-align: left;">
            <h4 class="my-auto" style="max-height: 30px; overflow: hidden;">${filterXSS(userList[i].username)}${verified}</h4>
          </div>
          <div class="col-sm-1 my-auto">
            <h4 class="my-auto"><img src="../IMG/${userList[i].rank}.svg" alt="${userList[i].rank}" width="50px"></h4>
          </div>
          <div class="col-sm-1 my-auto">
          </div>
          <div class="col-sm-2 my-auto">
            <div class="my-auto">
              <h5 class="my-auto">Lvl ${userList[i].level.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h5>
              <p class="my-auto">XP: ${xpParse(userList[i].xp)} / ${xpParse(userList[i].xpNeeded)}</p>
            </div>
          </div>
          <div class="col-sm-2 my-auto">
            <button class="btn btn-join my-auto" type="button" onclick="viewUser(${i})" ><i class="fas fa-sign-in-alt my-auto"></i> View</button>
          </div>
        </div>
      </div>
      </a>
    </li>
            `;
    }
    });


    console.log('%c HEY YOU SHOULDNT BE HERE', 'color: #F5CB5C; font-size: 50px;');
    console.log('%c Would you kindly not look at our source?', 'color: #F5CB5C; font-size: 25px;');
    console.log('%c Unless of course an official DisList staff member asked you to go in here.', 'color: #F5CB5C; font-size: 25px;');
}

function logout(){
    window.localStorage.removeItem('id');
    window.location.href = '/';
}


function viewUser(i){
    window.location.href=`/profile?id=${userList[i].id}`
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