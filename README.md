# TempChamberView
This app is used to control the temperature of the WickedDevice temperature calibration chamber.  

# Overview
There are two main components of this app, an express web server which supplies the web interface for controlling the temperature, and another 
app that runs on the raspi that controls the temperature of the chamber that polls the main app to check for new instructions.

# Installation
Clone the repo, and remove the node_modules folder if it is there.  Then run `npm install` to get dependencies.  It is reccomended to run the create-database.js file 
using `node create-database.js`, which creates the sqlite database file.  Make sure to change the production variable in src/db.js to true.
```javascript
const PRODUCTION = true;
```
To set your desired port to host on, edit SERVER_PORT in bin/www as such:
```javascript
const SERVER_PORT = 'port number';
```

You also must create a file in the project root called redacted.js, and fill it in as such:
```javascript
const redacted = {
    AQE_API_KEY: 'Put your air quality egg api key here',
    COOKIE_SECRET: 'Put your cookie secret here',
};

module.exports = redacted;
```

Once you have completed those steps you should see the [raspi client repo](https://github.com/chrsico210) (not created yet) to set it up on the raspi.

After setting the client up, you can run the program using `npm start`.  You can access the webpage at localhost:port_number (3000 by default), and can forward it to the 
web to access it from anywhere.