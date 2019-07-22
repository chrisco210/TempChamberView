/*
Arguments:
1st arg is time in minutes,
all subsequent are values to go to.
 */


let cycleTime = process.argv[2];
let rotations = process.argv[3].split(',');

var five = require("johnny-five");
var board = new five.Board({repl: false, debug: true});

const STEPPER_RPM = 5;



var opts = {
    steps: rotations[0],
    direction: 1,
    rpm: STEPPER_RPM,
};

//Only run when detected board is ready.
board.on('ready', () => {
    var stepper = new five.Stepper({
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: {
            step:11,
            dir: 13
        }
    });

    for(let i = 0; i < rotations.length; i++) {
        setTimeout(() => {
            stepper.rpm(STEPPER_RPM).ccw().step(rotations[i], () => {});

            if(i == rotations.length - 1) {
                process.exit();
            }
        }, cycleTime * i * 1000)
    }
});