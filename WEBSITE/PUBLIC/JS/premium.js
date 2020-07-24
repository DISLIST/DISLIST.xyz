const socket = io.connect('https://dislist.xyz/');

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
            document.getElementById('navbarNavDropdown').innerHTML += `<div class="btn-group ml-auto bg-transparent" id="profile"><button type="button" class="btn btn-transparent dropdown-toggle bg-transparent" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: white; font-weight: bold; border: 0px; border-color: none;"><img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${extension}" alt="${filterXSS(user.username)}" width="25px" class="rounded-circle my-auto"> ${filterXSS(user.username)}</button><div class="dropdown-menu dropdown-menu-right" style="right:0; left: auto;"><a class="dropdown-item" href="/profile?id=${user.id}"><i class="fas fa-user-astronaut"></i> Profile</a><a class="dropdown-item" href="/dashboard"><i class="fas fa-server"></i> Dashboard</a><div class="dropdown-divider"></div><a class="dropdown-item" href="#" onclick="logout()" style="color: #ff4343;"><i class="fas fa-sign-out-alt"></i> Logout</a></div><a href="/addserver"></div><button type="button" class="btn btn-add"><i class="fas fa-plus"></i> Add Server</button></a>`;
        });
    }else{
        document.getElementById('navbarNavDropdown').innerHTML += '<a href="https://discord.com/oauth2/authorize?client_id=720426204955410454&redirect_uri=https%3A%2F%2Fdislist.xyz%2Fauth&response_type=code&scope=identify%20guilds"><button type="button" class="btn btn-add ml-auto"><i class="fab fa-discord"></i> Login via Discord</button></a>';
    }

    console.log('%c HEY YOU SHOULDNT BE HERE', 'color: #F5CB5C; font-size: 50px;');
    console.log('%c Would you kindly not look at our source?', 'color: #F5CB5C; font-size: 25px;');
    console.log('%c Unless of course an official DisList staff member asked you to go in here.', 'color: #F5CB5C; font-size: 25px;');
}

function logout(){
    window.localStorage.removeItem('id');
    window.location.href = '/';
}