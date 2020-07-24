const socket = io.connect('https://dislist.xyz/');

socket.on('userdata', (data) => {
    if(data != null && data != undefined){
        window.localStorage.setItem('id', data);
        window.location.href = '/';
    }else{
        window.location.href = '/';
    }
});

function load(){
    console.log('%c HEY YOU SHOULDNT BE HERE', 'color: #F5CB5C; font-size: 50px;');
    console.log('%c Would you kindly not look at our source?', 'color: #F5CB5C; font-size: 25px;');
    console.log('%c Unless of course an official DisList staff member asked you to go in here.', 'color: #F5CB5C; font-size: 25px;');

    const fragment = window.location.toString().split('=').pop();
    socket.emit('auth', fragment);
}
