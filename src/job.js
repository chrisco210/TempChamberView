const child_process = require('child_process');
/**
 * Class that handles creation of Job child processes and handles events from them
 */
class Job {
    /**
     * Construct a Job and start it in a child process
     * @param {string} jobFile the path to the job to run
     * @param {string[]} args an array of string args to send to argv
     * @param {any} onclose the function to run when the job closes
     */
    constructor(jobFile, args, onclose) {
        this.process = child_process.fork(jobFile, args);
        
        this.process.addListener('exit', onclose);

        this.process.addListener('error', (err) => {
            console.log(`Error in ${jobFile}: ${JSON.stringify(err)}`);
        });

        this.process.addListener('message', (message, sender) => {
            console.log(`Message from ${sender}: ${message}`);
        });
    }
}


module.exports = Job;