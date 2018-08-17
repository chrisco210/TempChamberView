let Job = require('./job');
var ExecManager = require('./execution-manager');
var config = require('./config');


/**
 * Instruction manager
 * The instruction manager has a queue of instructions waiting to be executed
 */
class Manager {

    /**
     * Construct an instruction manager      
    */
    constructor() {
        this.instructionStack = [];     //Instruction stack
        this.running = null;    //Last run instruction
        this.runningJob = null;
        this.exec = new ExecManager(this);
    }

    /**
     * Push an instruction onto the instruction stack
     * @param {Instruction} instruction the instruction to push onto the stack
     */
    pushInstruction(instruction) {
        this.instructionStack.push(instruction);

        this.exec.onpush();
    }

    /**
     * Return the most recent instruction from the stack
     * @returns the most recent instruction from the stack
     */
    getMostRecentInstruction() {
        return this.instructionStack[instructionStack.length - 1];
    }

    /**
     * Get the full instruction stack
     */
    getInstructionStack() {
        return this.instructionStack;
    }

    /**
     * Get the current running instruction
     */
    getRunningInstruction() {
        return this.running;
    }


    /**
     * Run the instruction at the top of the instruction stack
     */
    runInstruction(cb) {
        this.running = this.instructionStack[0];

        this.runningJob = new Job(this.running.file, this.running.argsAsArray(), () => {
            console.log('Instruction finished executing');
            this.exec.oncomplete();
        });

    }

    /**
     * Terminates a running job. Returns true if terminated, false if no job running
     */
    stopJob() {
        if(this.runningJob) {
            this.runningJob.kill();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Remove an instruction from the queue
     * @param {number} instruction the index of the instruction to remove
     */
    removeInstruction(instruction) {
        this.instructionStack.splice(instruction, 1);
        console.log(`New instrman state: ${JSON.stringify(this.instructionStack)}`);
    }
}

/**
 * Instruction object which represents instructions with options
 */
class Instruction {
    /**
     * Construct an instruction with the OPERATION from the OPERATIONS constant, and options, which is an object with 
     * linking argname->argvalue
     * @param {one object from OPERATIONS object} op one of the OPERATIONS constant
     * @param {any} options the arguments to provide.  Use the ones specified in the OPERATIONS constant
     */
    constructor(op, options) {
        this.instruction = op;
        this.args = options;
        
        config.operations.forEach((property) => {
            console.log(`${property}==${op}`);
            console.log(property.name === op);
            if(property.name === op) {
                this.file = property.file;
            }
        });
    }

    argsAsArray() {
        let retArr = [];

        for(let property in this.args) {
            retArr.push(this.args[property]);
        }

        return retArr;
    }
}
module.exports.Manager = Manager;
module.exports.Instruction = Instruction;