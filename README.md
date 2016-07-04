# ArduinoScope
A simple browser-based graph of arduino pins using firmata
Arduino must be running firmata

https://github.com/firmata/arduino

# How to run 
No package.json included, just do:

``` 
npm i microtime.js 
npm i express 
npm i socket.io 
npm i johnny-five
```

## Don't forget to plug in your Arduino (tested with Nano v3)

``` node scope.js ```

If all goes well you should see pins A0, A1, A2 graphed at http://127.0.0.1:3000

The front end could use some serious work, but for now it is effective. You should 
expect to see a 50hz or 60hz wave if nothing is connected, depending on where you live.

https://en.wikipedia.org/wiki/Mains_hum
