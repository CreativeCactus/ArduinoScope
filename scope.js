
var PORT = 3000

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(PORT,()=>{ console.log("http://127.0.0.1:3000/") });


ScanInterval=50//ms
INPUTS = {
    'A0':0,
    'A1':0,
    'A2':0
} //Which pins to read from. At this point the value is ignored and the keys are used as an array

var HTML = `Server not ready, try F5...`
app.get('/', function (req, res) {
  res.send(HTML);
});

HTML=`
<html>
    <head>
        <script src="/socket.io/socket.io.js"></script>
    </head>
    <body>
        <canvas id="myCanvas" width="1400" height="900" style="border:1px solid #d3d3d3;">
            Your browser does not support the HTML5 canvas tag.
        </canvas>
        <script>
            const TMAX = 2000000 //number of time samples to keep (100k = 1s)
            var YScale = 0.7 //number of px per V
            var XScale = 0.0005 //number of px per T
            var XMargin = 15 //number of px to left of graph
            var YSpacing = 100 //number of px to multiply YOffset by between graphs
            var MYID = null;
            
            var T = [] //Timeline of data
            var Datas = {} //Map of map[t]value
            
            var messages=['Initialised.'];
            var canvas = document.getElementById("myCanvas");
            var ctx = canvas.getContext("2d");
            ctx.font="30px Verdana";

            var socket = io();
                        
            socket.on('update', function(msg){
                T.push(msg.t)
                
                // If there is a D(ata) field on the message, add the value at time t in every Datas map specified.
                // For example, {t:10, D:{temp:30}} would add Datas['Temp'][10]=30
                if (msg.D) for ( var v in msg.D ) if ( msg.D.hasOwnProperty(v) ){
                    Datas[v]=Datas[v]||{}
                    Datas[v][msg.t]=msg.D[v]
                }
                    
                // Make sure that our oldest t is only TMAX time steps older than our newest t
                var i=0, duration=()=>{ return msg.t-(i?T.shift():T[0])  } 
                while(duration(i)>TMAX){i++}
                
                DrawData()
                
                // Postpone a cleanup of orphaned Datas when we have some spare compute
                setTimeout(Cleanup,0)                
            });
            
            socket.on('HelloAck', function(msg){
                console.dir({ACK:msg})
                MYID=msg.ID
                messages.push("Recieved ACK and ID:"+msg.ID+" from server at "+msg.t+".")
                if (msg.Di) for ( var v in msg.Di ) if ( msg.Di.hasOwnProperty(v) ){
                    Datas[v]=msg.Di[v]||{}
                }
            });
            socket.emit('Hello', {});
            
            function DrawMessages(){
                //for each message, draw it in a HUD on the graph, each message may be string or object.msg
                //currently a stub using console.log
                for (var m in messages) 
                    if (typeof m == "string") console.log(m)
                    else                      console.log(m.msg)
                messages=[]
            }
            
            // In this case we draw the line for each Data, which is cumbersome to loop but faster to draw.
            function DrawData(){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for( var D in Datas ) if( Datas.hasOwnProperty(D) ) {
                    ctx.beginPath(); 
                    YOffset = (Datas[D].meta?Datas[D].meta.YOffset||1:1) * YSpacing
                    
                    ctx.fillText(D,XMargin, YOffset + Datas[D][ T[0] ] * YScale - 10);
                    ctx.moveTo(XMargin, YOffset + Datas[D][ T[0] ] * YScale)
                    for( var t in T ) if( Datas[D][ T[t] ] !== undefined ) {
                        ctx.lineTo(XMargin+ (T[t]-T[0])*XScale, YOffset + Datas[D][ T[t] ] * YScale);
                    }
                    ctx.stroke();
                }
            }
            
            // Take a moment to clean up the orphaned Datas. 
            // We do so by making a new array and only copying over values for extant T's
            function Cleanup(){
                for( var v in Datas ) if ( Datas.hasOwnProperty(v) ) {
                    out = {meta:Datas[v].meta}
                    for( var t in T ) if(Datas[v][T[t]]) out[T[t]]=Datas[v][T[t]]
                    Datas[v] = out
                }
            }
            
        </script>
    </body>
</html>`

io.on('connection', function(socket){
    socket.on('Hello', function(msg){
        UID=~~(Math.random()*(1<<16))
        console.log(`New client: ${UID}`)
        io.emit('HelloAck',Initial());
    });
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


var mtime = require('microtime.js')
var init = mtime.micro()
function time(){
    return ~~( (mtime.micro()-init) / 10 )
}        
        
var five = require("johnny-five");
var board = new five.Board();
board.on("ready", function() {
    
    var led = new five.Led(13);
    led.blink(500);
    
    Datas={} // Much like the datas on the client side, only here we keep a map[D]{t,v}, though t isn't used yet
    initSensor=(name)=>{
        var sensor = new five.Sensor(name);
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

    //clearInterval(interval);
});

