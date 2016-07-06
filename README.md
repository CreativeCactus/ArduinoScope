# ArduinoScope
A simple browser-based graph of arduino pins using firmata

Arduino must be running <a href="https://github.com/firmata/arduino">firmata</a>

# How to run 

You can npm i directly from github like this:

```
npm i CreativeCactus/ArduinoScope
node ./node_modules/arduinoscope/scope.js
```

## Don't forget to plug in your Arduino (tested with Nano v3)

``` node scope.js ```

If all goes well you should see pins A0, A1, A2 graphed at http://127.0.0.1:3000

PROTIP: Chrome seems to handle this a lot better than Firefox (at least on linux)
I am yet to profile anything, but I would expect either the obvious canvas calls or the 
 setTimeout calls, which I have seen cause problems in previous projects under specific FF versions

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
- Digital pins
- Simplify API
- Figure out why labels are hidden until sample list is filled

# Backstory
Two years ago I purchased an Emotiv EPOC consumer EEG. I found it to be utterly awesome, but I wanted to be able to hack with it. 
Despite an absolute lack of hardware knowledge I decided to embark on a journey to build my own. After many iterations and tests, 
I have found this to be a suitable setup for me to test until I have a design worth printing on PCB.

Here is what my latest progress looks like. Some 2.7~ hz noise coming from either my legs where the electrodes are currently attached, or something in my two filters.
<img src="https://raw.githubusercontent.com/CreativeCactus/ArduinoScope/master/wip.png"></img>

My current design is based on <a href="https://people.ece.cornell.edu/land/courses/ece4760/FinalProjects/s2012/cwm55/cwm55_mj294/">THIS</a>:
<img src="https://people.ece.cornell.edu/land/courses/ece4760/FinalProjects/s2012/cwm55/cwm55_mj294/img/amplifier.png"></img>