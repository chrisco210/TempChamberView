var five = require("johnny-five");
var board = new five.Board();

function moveStepper (steps){
  console.log("about to move " + steps + " steps.");
  try {
    board.on("ready", function() {
    console.log("Ready.");

    var stepper = new five.Stepper({
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: {
        step:11,
        dir: 13
      }
    });
    stepper.rpm(5).ccw().step(steps, function() {
      console.log("Done moving " + steps + " steps.");
    });
    });
  } catch (e) {
  console.log('Something went wrong-- could not move stepper.');
  console.log(e.message);
 }
}
moveStepper(process.argv[2]);
setTimeout(() => {process.exit(0);}, 10000);
