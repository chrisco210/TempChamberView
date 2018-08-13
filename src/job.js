const child_process = require('child_process');
/**
 * Class that handles creation of Job child processes and handles events from them
 */
class Job {
    constructor(jobFile, args) {
        this.process = child_process.fork(jobFile, args);
        
        this.process.addListener('close', (code, sig) => {
            console.log(`Job ${jobFile} exited with code ${code}: ${sig}`);            
        });

        this.process.addListener('exit', (code, signal) => {
            console.log(`Job ${jobFile} exited with code ${code}: ${sig}`);    
        });

        this.process.addListener('error', (err) => {
            console.log(`Error in ${jobFile}: ${JSON.stringify(err)}`);
        });

        this.process.addListener('message', (message, sender) => {
            console.log(`Message from ${sender}: ${message}`);
        });
    }
}
