var five = require("johnny-five");
var board = new five.Board({repl: false, debug: true});
var config = require('../config');

//Ratio of turns/degC
let SENSITIVITY = process.argv[2];
//Minimum difference to correct for
let ACCURACY = process.argv[3];
// The timeout between corrections
let TIMEOUT = process.argv[4] * 1000 * 60;
//The temperature to target
let TARGET = process.argv[5];

var request = require('request-promise');

let requestOptions = {
    uri: `https://airqualityegg.wickeddevice.com/api/v2/most-recent/messages/device/${config.api.dataEgg}`,
    headers: {
        Authorization: `Bearer ${config.secret.AQE_API_KEY}`
    }
};

const STEPPER_RPM = 5;

var opts = {
    steps: 0,
    direction: 1,
    rpm: STEPPER_RPM,
};


function adjust(tempTarget, stepper) {
    request(requestOptions).then((res) => {
        let temp = JSON.parse(res).temperature['converted-value'];
        let diff = tempTarget - temp;

        console.log(`Found difference of ${diff}`);

        if(Math.abs(diff) > ACCURACY) {
            console.log(`Stepping ${diff * SENSITIVITY} steps`);
            stepper.rpm(STEPPER_RPM).ccw().step(diff * SENSITIVITY, () => {});
        }
    }).catch((err) => {
        console.error(err);
        process.exit();
    })
}

board.on('ready', () => {
    var stepper = new five.Stepper({
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: {
            step:11,
            dir: 13
        }
    });

    setInterval(adjust(TARGET, stepper), TIMEOUT)
});