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

# Further use

You may like to configure the ScanInterval to be around 100 if you are finding poor performance.
At some point I will transition this project to Go in an attempt to speed things up.

You can of course add as many pins as you like to the INPUTS map at the top.

You may notice that the LED on the NanoV3 flashes each second. This is 500ms on, 500ms off. 
The LED is actually connected to D13, so if you connect D13 to A0 (and GND to AREF, if you like)
you will see time lines of each 500ms in your graph.

# Coming soon
## Yeah sure, that's what they all say

- FFT
- 3D
- Time bars
- Digital pins
- Simplify API