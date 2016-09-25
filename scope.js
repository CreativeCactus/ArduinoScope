var PORT = 3000

var mtime = require('microtime.js')
var five = require("johnny-five")
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(PORT,()=>{ console.log(`http://127.0.0.1:${PORT}/`) });

ScanInterval=30//ms
INPUTS = {
    'A1':0,
    'A5':0,
    'A6':0
} //Which pins to read from. At this point the value is ignored and the keys are used as an array

app.get('/', function (req, res) {  res.sendFile(__dirname+'/client.html') });

//Set up the connection by listening for the only client-to-server packet we expect.
io.on('connection', function(socket){
    socket.on('Hello', function(msg){
        UID=~~(Math.random()*(1<<16))
        console.log(`New client: ${UID}`)
        io.emit('HelloAck',Initial());
    })
})


//Return an object with initial setup for client
function Initial (){
    var iout={ ID: UID, Di:{} , '_note':'init' }
    n=1
    for( var i in INPUTS )
        iout.Di[i] = {meta:{YOffset:n++}}
    iout.t=time()
    console.dir(iout)
    return iout
}


var init = mtime.micro()
function time(){
    return ~~( (mtime.micro()-init) / 10 )
}        
        
var board = new five.Board();//{repl:false});//if you want to automate things.
board.on("ready", function() {
    var led = new five.Led(13);
    led.blink(500);
    
    // Much like the datas on the client side, only here we keep a map[D]{t,v}, though t isn't used yet
    // At runtime this should look something like:
    // {
    //      A0: {v:1024, t:12345},
    //      A1: {v:10,   t:12555}
    //  }
    Datas={} 
    
    initSensor=(name)=>{
        var sensor = new five.Sensor(name,~~(ScanInterval/2)||5);
        sensor.on("change", function(value) {
            Datas[name]={t:time(),v:value}
        });
        console.log(`PINIT:${name}`)
    }
    for(var i in INPUTS) initSensor(i);
    
    var interval = setInterval(function() {
        out={D:{}}
        for(var d in Datas) if (Datas.hasOwnProperty(d))
            out.D[d]=Datas[d].v
        out.t=time() 
        io.emit('update', out);
    }, ScanInterval);

    this.repl.inject({
        five,
        this:this
    });
});

