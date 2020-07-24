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

      socket.emit('getUserProfileData', params.get('id'));
      socket.on('userProfileDataObtained', (data) => {

        switch (data.staffTier) {
          case 0:
            var verified = ``;
            var support = ``;
            var developer = ``;
            var owner = ``;
            break;
          case 1: 
            var verified = ` <i class="fas fa-check-circle" style="color: #F5CB5C"></i>`;
            var support = `<li class="list-inline-item"><h3 class="mb-5"><kbd style="background-color: #F5CB5C; color: #333;">Support</kbd></h3></li>`;
            var developer = ``;
            var owner = ``;
            break;
          case 2: 
            var verified = ` <i class="fas fa-check-circle" style="color: #F5CB5C"></i>`;
            var support = `<li class="list-inline-item"><h3 class="mb-5"><kbd style="background-color: #F5CB5C; color: #333;">Support</kbd></h3></li>`;
            var developer = `<li class="list-inline-item"><h3 class="mb-5"><kbd style="background-color: #03fcfc; color: #333;">Dev</kbd></h3></li>`;
            var owner = ``;
            break;
          case 3: 
            var verified = ` <i class="fas fa-check-circle" style="color: #F5CB5C"></i>`;
            var support = `<li class="list-inline-item"><h3 class="mb-5"><kbd style="background-color: #F5CB5C; color: #333;">Support</kbd></h3></li>`;
            var developer = `<li class="list-inline-item"><h3 class="mb-5"><kbd style="background-color: #03fcfc; color: #333;">Dev</kbd></h3></li>`;
            var owner = `<li class="list-inline-item"><h3 class="mb-5"><kbd id="owner" style="color: #333;">Creator</kbd></h3></li>`;
            break;
          default:
            var verified = ``;
            var support = ``;
            var developer = ``;
            var owner = ``;
            break;
        }


        if(data.staffTier){
          var verified = ` <i class="fas fa-check-circle" style="color: #F5CB5C"></i>`;
        }else{
          var verified = '';
        }
        if(data != false){
          var logourl;
        var date = new Date(data.createdAt)
        var banned;
        if(parseInt((data.xp / data.xpNeeded) * 100) <= 5){
          var progressColor = 'color: white;'
        }else{
          var progressColor = 'color: #333;'
        }
        if(data.banned == false){
          banned = ``;
        }else if(data.banned == true){
          banned = `<li class="list-inline-item"><h3 class="mb-5"><kbd style="background-color: #ff4d4d; color: #333;">BANNED</kbd></h3></li>`;
        }
        if(data.avatar === null){
          logourl = '../IMG/dslogo.jpg';
      }else{
        if(data.avatar.toString().includes('a_')){
          extension1 = '.gif';
      }else{
          extension1 = '.jpg';
      }
        logourl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}${extension1}`;
      }
        document.getElementById('userCard').innerHTML = `
        <div class="p-5" style="background-color: #222; border-radius: 10px;">
            <img src="${logourl}" alt="${filterXSS(data.username)}" width="100px" class="mb-3 rounded-circle">
            <h1>${filterXSS(data.username)}#${data.discriminator}${verified}</h1>



            <ul class="list-inline bg-transparent">${banned}${support}${developer}${owner}</ul>

  
            <div class="row">
            <div class="col-sm-3 mt-3">
            <h3>Rank</h3>
            <img src="../IMG/${data.rank}.svg" alt="${filterXSS(data.rank)}" width="40px">
            <h4>${data.rank}</h4>
            </div>
            <div class="col-sm"></div>
            <div class="col-sm-3 mt-3">
            <h3>Level</h3>
            <h4> Lvl ${data.level.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<h4>
                      <h6>Xp: ${xpParse(data.xp)} / ${xpParse(data.xpNeeded)}</h6>
                        <div class="progress" style="background-color: #444;">
                          <div class="progress-bar bg-warning" role="progressbar" style="font-weight: bold; ${progressColor} !important; width: ${parseInt((data.xp / data.xpNeeded) * 100)}%;" aria-valuenow="${parseInt((data.xp / data.xpNeeded) * 100)}" aria-valuemin="0" aria-valuemax="100">${parseInt((data.xp / data.xpNeeded) * 100)}%</div>
                        </div>
            </div>
            <div class="col-sm"></div>
            <div class="col-sm-3 mt-3">
            <h3>Registered On</h3>
            <h4>${date.toLocaleString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit"
            })}</h4>
            </div>
            </div>
          </div>
        `;
        }else{
          document.getElementById('userCard').innerHTML = `
          <div style="margin: 10%; color: #333;">
          <h1>THE SPECIFIED USER ISNT ON DISLIST.</h1>
          <p>Redirecting to home in 3 seconds.</p>
          </div>
          `;
          setTimeout(() => {
            window.location.href = '/users';
          }, 3000);
        }



        setInterval(() => {
          switch (data.staffTier) {
            case 3: 
            document.getElementById('owner').style.backgroundColor = `rgb(${randomNum(100,255)},${randomNum(100,255)},${randomNum(100,255)})`;
              break;
            default:
              break;
          }
        }, 500);
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

function randomNum(i1, i2){
  return Math.floor(Math.random() * i2 + i1);
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
