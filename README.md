# TempChamberView
This app is used to control the temperature of the WickedDevice temperature calibration chamber.  

# Overview
There are two main components of this app, an express web server which supplies the web interface for controlling the temperature, and another 
app that runs on the raspi that controls the temperature of the chamber that polls the main app to check for new instructions.

# Installation
## Downlading
Clone the repository into the desired location.  After downloading, it is reccomended you redownload all dependencies by removing the node_modules folder (`rm -rf ./node_modules`),
and then reinstalling them by running `npm install`.

## Generating the database
To create the database, run `node create-database.js`, which creates the sqlite database file, and initializes it with default tables and default logins (which you should change).  Make sure to change the production variable in src/db.js to true BEFORE running this command, or the testing database will be created.  If you wish you can test the database by running `node test-database.js` and making sure you get an expected output.

To switch to production mode, update src/db.js as such:
```javascript 
// src/db.js
const PRODUCTION = true;
```

## Configuration
To set your desired port to host on, edit SERVER_PORT in bin/www as such:
```javascript
// bin/www
const SERVER_PORT = 'port number';
```
You MUST create a file in the project root called redacted.js, and fill it in as such:
```javascript
// redacted.js
const redacted = {
    AQE_API_KEY: 'Put your air quality egg api key here.  You will need an api key for the app to work properly.',
    COOKIE_SECRET: 'Put your cookie secret here. This can be any random string of charachters',
};

module.exports = redacted;      //Make sure to export 
```
## Client Installation
Once you have completed those steps you should see the [raspi client repo](https://github.com/chrsico210) (not created yet) to set it up on the raspi.

# Startup
After setting the client up, you can run the program using `npm start`.  You can access the webpage at localhost:port_number (3000 by default), and can forward it to the 
web to access it from anywhere.  

## First time login
The default username for login is root, the default password is password.  You can change these in the admin panel (coming soon).