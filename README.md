# TempChamberView
This app is used to control the temperature of the WickedDevice temperature calibration chamber.  

# Overview
There are two main components of this app, an express web server which supplies the web interface for controlling the temperature, and another 
app that runs on the raspi that controls the temperature of the chamber that polls the main app to check for new instructions.

# Dependencies
scss is required to compile the CSS files.  Check if you have scss by typing `scss --version` (ideally before running npm install).  If you do not, install the ruby version of sass by running `gem install sass -v 3.4.22`.

In addition, you will need nodejs, as well as npm.

# Installation
After cloning the repository, type `npm install` to install all dependencies and run all setup scripts. These will create the database and generate all api keys required.  

# Config
By default the config looks like this (Without comments):
```
{
    "production": true,  //If true, production mode enabled, if false, development mode enabled. Default: true
    "api": {        //Sensor API settings
        "dataEgg": "egg00802fbeaf1b0130",   //The serial of the egg to get data from. Default: egg00802fbeaf1b0130
        "dataSensors": [        //The names of the sensors that you want to be displayed.
            "temperature",
            "humidity",
            "no2"
        ]
    },
    "database": {       //The path to the database file relative to the install directory.  Default: .
        "path": "."
    },
    "server": {     //Web server settings
        "port": 3000        //The port to host on
    },
    "operations": [     //Add operations here
        {
            "name": "settemp",      //The name of the operation to be displayed
            "desc": "Set the temperature of the chamber using the number of turns",     //A useful description of the operation
            "options": [        //Add arguments to this array by adding more objects
                {
                    "name": "turns",        //The name of the option that will be displayed in the label
                    "type": "number"        //The data type of the option.  Note this must be a valid type attribute of a html input tag
                }
            ],
            
            "file": "src/jobs/settemp"      //The path, relative to project root, to the nodejs module of this command.
        },
        {
            "options": [],      //If there are no arguments, simply provide a blank array.
            "name": "Calibration",
            "desc": "Run temperature egg calibration routine.",
            "file": "src/jobs/calibrate"
        },
        {
            "options": [        //An example of multiple options
                {
                    "name": "test1",
                    "type": "text"
                },
                {
                    "name": "test2",
                    "type": "text"
                }
            ],
            "name": "test",
            "file": "src/jobs/test.js"
        }
    ],

    //Super secret stuff
    "secret": {
        "extern": false,        //Use this option to provide a path to an external file to hold secrets. Default: false
        "AQE_API_KEY": "",      //Put your Air Quality Egg API Key here.  You will need this for the dashboard to display sensor 
        "COOKIE_SECRET": ""     //The cookie secret.  This can be any random string     
    }
}
```

# Startup
After setting the client up, you can run the program using `npm start`.  You can access the webpage at localhost:port_number (3000 by default), and can forward it to the 
web to access it from anywhere.  

## First time login
The default username for login is root, the default password is password.  You can (and should) change the password in the settings panel.

# Temperature Chamber API 
## Instruction API
### api/instructions/recent
Return the current instruction stack as json array

Requires an authorization header containing a key with the permission READ_INSTRUCTION
### api/instructions/push
Push a new instruction onto the instruction stack.

Requires a valid session. This should only be done from the included web interface
## Sensor API
### api/sensors
Get the most recent sensor data from the reference egg as json

Requires an authorization header containing a key with the permission READ_SENSOR
