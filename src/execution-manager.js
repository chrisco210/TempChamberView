/**
 * Handles ordered execution of the instruction manager
 */
class ExecutionManager {
    /**
     * Construct an ExecutionManager with the instruction manager it will read from
     * @param {Manager} instructionManager the manager that will be read by this execution manager 
     */
    constructor(instructionManager) {
        this.instructionManager = instructionManager;
    }

    
    onpush() {
        console.log('onpush called');
        if(this.instructionManager.instructionStack.length > 1) {

        } else {
            this.instructionManager.runInstruction(this.oncomplete);
        } 
    }

    oncomplete() {
        console.log('oncomplete called');
        this.instructionManager.removeInstruction(0);
        this.instructionManager.running = null;
        console.log(`New  ExecMan state: ${JSON.stringify(this.instructionManager.instructionStack)}`);
        if(this.instructionManager.instructionStack.length >= 1) {
            this.instructionManager.runInstruction(this.oncomplete);
        }
    }
}

module.exports = ExecutionManager;