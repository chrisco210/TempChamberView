var five = require("johnny-five");
var board = new five.Board({repl: false, debug: true});

const STEPPER_RPM = 5;

const CYCLE_TIME = 18000000; //5 hours in ms
const STAGE_POSITIONS = [-190, 130, 66, 35, 37, 38, -116];    //Cycle positions to move

var opts = {
  steps: STAGE_POSITIONS[1],
  direction: 1,
  rpm: STEPPER_RPM,
};

board.on('ready', () => {
var stepper = new five.Stepper({
  type: five.Stepper.TYPE.DRIVER,
  stepsPerRev: 200,
  pins: {
    step:11,
    dir: 13
  }});
//stepper.step(opts, function() {console.log('finished');});
//console.log('done');


  //May try to get this in a for loop later, this will do for now
new Promise((resolve, reject) => {
  try {
	console.log('Moving the stepper');
      //Move the stepper
      stepper.rpm(STEPPER_RPM).ccw().step(STAGE_POSITIONS[0], () => {
      });
	resolve();
  } catch (e) {
    reject(e);
 }
})
.then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, CYCLE_TIME);
  });
})
.then((res) => {
  return new Promise((resolve, reject) => {
	
    try {
	console.log('moving the stepper');
        stepper.rpm(STEPPER_RPM).ccw().step(STAGE_POSITIONS[1], () => {
	console.log('done');          
        });
	resolve();
    } catch (e) {
      reject(e);
   }
  })
})
.then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, CYCLE_TIME);
  });
})
.then((res) => {

  return new Promise((resolve, reject) => {
	console.log('moving'); 
   try {
        //Move the stepper
        stepper.rpm(STEPPER_RPM).ccw().step(STAGE_POSITIONS[2], () => {
      });
	resolve();
    } catch (e) {
      reject(e);
   }
  })
})
.then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, CYCLE_TIME);
  });
})
.then((res) => {
  return new Promise((resolve, reject) => {
   
	console.log('moving');

 try {
        //Move the stepper
        stepper.rpm(STEPPER_RPM).ccw().step(STAGE_POSITIONS[3], () => {
      });
	resolve();
    } catch (e) {
      reject(e);
   }
  })
})
.then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, CYCLE_TIME);
  });
})
.then((res) => {
  return new Promise((resolve, reject) => {
	console.log('moving'); 
   try {
        //Move the stepper
        stepper.rpm(STEPPER_RPM).ccw().step(STAGE_POSITIONS[4], () => {
      });
	resolve();
    } catch (e) {
      reject(e);
   }
  })
})
.then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, CYCLE_TIME);
  });
})
.then((res) => {
  return new Promise((resolve, reject) => {
    try {
	console.log('moving');
       //Move the stepper
        stepper.rpm(STEPPER_RPM).ccw().step(STAGE_POSITIONS[5], () => {
        });
	resolve();
    } catch (e) {
      reject(e);
   }
  })
})
.then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, CYCLE_TIME);
  });
})
.then((res) => {
  return new Promise((resolve, reject) => {
    try {
	console.log('moving');
        //Move the stepper
        stepper.rpm(STEPPER_RPM).ccw().step(STAGE_POSITIONS[6], () => {
      });
	resolve();
    } catch (e) {
      reject(e);
   }
  })
}).then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
	process.exit();
    }, CYCLE_TIME);
  });
})
.catch((err) => {
  console.log(err);
});
});

