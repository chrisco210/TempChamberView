# TempChamberView
This app is used to control the temperature of the WickedDevice temperature calibration chamber.  

# Overview
There are two main components of this app, an express web server which supplies the web interface for controlling the temperature, and another 
app that runs on the raspi that controls the temperature of the chamber that polls the main app to check for new instructions.

# Installation
TODO Write installation documentation

# Startup
After setting the client up, you can run the program using `npm start`.  You can access the webpage at localhost:port_number (3000 by default), and can forward it to the 
web to access it from anywhere.  

## First time login
The default username for login is root, the default password is password.  You can change these in the admin panel (coming soon).

# Temperature Chamber API 
## Instruction API
### api/instructions/recent
Return the current instruction stack as json array

Requires an authorization header containing a key with the permission READ_INSTRUCTION
### api/instructions/push
Push a new instruction onto the instruction stack.

Requires a valid session. This should only be done from the included web interface

Requires an authorization header containing a key with the permission WRITE_INSTRUCTION  

## Sensor API
### api/sensors
Get the most recent sensor data from the reference egg as json

Requires an authorization header containing a key with the permission READ_SENSOR