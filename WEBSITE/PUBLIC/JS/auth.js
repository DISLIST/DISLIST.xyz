const socket = io.connect('http://localhost/');

socket.on('userdata', (data) => {
    if(data != null && data != undefined){
        window.localStorage.setItem('id', data);
        window.location.href = '/';
    }else{
        window.location.href = '/';
    }
});

function load(){
    console.log('%c HEY YOU SHOULDNT BE HERE', 'color: #0095ff; font-size: 50px;');
    console.log('%c Would you kindly not look at our source?', 'color: #0095ff; font-size: 25px;');
    console.log('%c Unless of course an official DisList staff member asked you to go in here.', 'color: #0095ff; font-size: 25px;');

    const fragment = window.location.toString().split('=').pop();
    socket.emit('auth', fragment);
}
