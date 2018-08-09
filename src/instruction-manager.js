
const OPERATIONS = {
    SET_TEMP: {options: [{name: 'turns', type: 'number'}], name: 'settemp'}, 
    BLINK_LED: {options: [], name: 'blink'},
    TEST: {options: [{name: 'test1', type: 'text'}, {name: 'test2', type: 'number'}], name: 'test'}
};

/**
 * Instruction manager
 */
class Manager {

    /**
     * Construct an instruction manager 
     */
    constructor() {
        this.instructionStack = [];
    }

    /**
     * Push an instruction onto the instruction stack
     * @param {Instruction} instruction the instruction to push onto the stack
     */
    pushInstruction(instruction) {
        this.instructionStack.push(instruction);
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
     * Remove an instruction from the queue
     * @param {number} instruction the index of the instruction to remove
     */
    removeInstruction(instruction) {

    }
}

/**
 * Instruction object which represents instructions with options
 */
class Instruction {
    /**
     * Construct an instruction with the OPERATION from the OPERATIONS constant, and options, which is an object with 
     * linking argname->argvalue
     */
    constructor(op, options) {
        this.instruction = op;
        this.args = options;
    }
}

module.exports.OPERATIONS = OPERATIONS;
module.exports.Manager = Manager;
module.exports.Instruction = Instruction;