var five = require("johnny-five");
var board = new five.Board({repl: false, debug: true});
var steps = process.argv[2];
const STEPPER_RPM = 5;

board.on('ready', () => {
var stepper = new five.Stepper({
  type: five.Stepper.TYPE.DRIVER,
  stepsPerRev: 200,
  pins: {
    step:11,
    dir: 13
  }});


  //May try to get this in a for loop later, this will do for now
    new Promise((resolve, reject) => {
    try {
        console.log('Moving the stepper');
        //Move the stepper
        stepper.rpm(STEPPER_RPM).ccw().step(steps, () => {
        });
        resolve();
    } catch(e) {
        reject(e);
    }
    })
    .then((res) => {
        process.exit(0);
    }).catch((err) => {
        process.exit(1);
    });
});