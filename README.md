# TempChamberView
This app is used to control the temperature of the WickedDevice temperature calibration chamber.  

# Overview
There are two main components of this app, an express web server which supplies the web interface for controlling the temperature, and another 
app that runs on the raspi that controls the temperature of the chamber that polls the main app to check for new instructions.

# Dependencies
sass is required to compile the CSS files.  Check if you have scss by typing `sass --version` (ideally before running npm install).  If you do not, install the ruby version of sass by running `gem install sass -v 3.4.22`.

In addition, you will need nodejs, as well as npm.

All other depndencies are automatically installed during installation.

# Installation
After cloning the repository, type `npm install` to install all dependencies and run all setup scripts. These will create the database and generate all api keys required, as well as insert them into all required fields.

# Configuration
The configuration file is in [hjson](https://hjson.org/). 

By default the config looks like this (Without comments, but you can add them if you want):
```
{
  //Specifies if production mode is enabled. Default: true
  production: true
  
  //API settings
  api:      
  {
    //The egg to collect data from.  Default: egg00802fbeaf1b0130
    dataEgg: egg00802fbeaf1b0130
    //The sensors to include on the web page
    dataSensors:
    [
      temperature
      humidity
      co
      no2
    ]
  }
  //Database settings.  Not reccomended to change
  database:
  {
    //The path to the database file
    path: .
  }

  //Server settings
  server:
  {
    //The port to serve the project on
    port: 3000
  }

  //Add new operations here.  Add operations by adding more operation objects to the array:
  //Prototype:
  /*
  {
      name: string      //The name of the operation
      desc: string      //A description of what the operation does
      file: string      //The path to the module that will be run when the operation is executed
      options: [        //The arguments that will be passed to the operation
          {
              name: string,         //The name of the argument
              desc: string,         //A description of what the argument is
              type: string          //The datatype of the option.  This must be compatable with the type parameter of the html <input> tag
          }, 
          ...
      ]
  }
  */
  operations:
  [
    {
      options:
      [
        {
          name: turns
          desc: How many turns.  Positive is clockwise, negetive is ccwise
          type: number
        }
      ]
      name: settemp
      desc: Set the temperature of the chamber using the number of turns
      file: src/jobs/settemp
    }
    {
      options: []
      name: Calibration
      desc: Run temperature egg calibration routine.
      file: src/jobs/calibrate
    }
    {
      options:
      [
        {
          name: test1
          type: text
        }
        {
          name: test2
          type: text
        }
      ]
      name: test
      file: src/jobs/test.js
    }
  ]
  //Secret things
  secret:
  {
    extern: false       //If you want to provide an external secret file, do so here (eg, you are using a public git repo). Default: false
    AQE_API_KEY: ""     //Put your air quality egg api key here
    COOKIE_SECRET: ""       //Put a cookie secret here
  }
}
```

# Startup
After setting the client up, you can run the program using `npm start`.  You can access the webpage at localhost:port_number (3000 by default), and can forward it to the 
web to access it from anywhere.  

## Scripts
`npm install` will install all dependencies and generate all required things

`npm run-script generate-scss` will compile the materialize scss files

`npm run-script generate-config` will generate the default config.hjson file

`npm run-script generate-database` will generate a default database

`npm run-script generate-js` will render the webindex file


## First time login
The default username for login is root, the default password is password.  You can (and should) change the password in the settings panel.

# Temperature Chamber API 
## Instruction API
### api/instructions/recent
Return the current instruction stack as json array

Requires an authorization header containing a key with the permission READ_INSTRUCTION
### api/instructions/push
Push a new instruction onto the instruction stack.

Requires a valid session. This should only be done from the web interface
### api/instructions/kill
Kill the current running job.

Requires a valid session.  This should only be done from the web interface

### api/instructions/delete
Delete a job from the queue
#### Parameters
##### inst
Type: url
Value: The index of the instruction stack to delete from

Requires a valid session.  This should only be done from the web interface 
### api/instructions/running
Get the current running instruction

Requires an API key with permission READ_INSTRUCTION
## Sensor API
### api/sensors
Get the most recent sensor data from the reference egg as json

Requires an authorization header containing a key with the permission READ_SENSOR
