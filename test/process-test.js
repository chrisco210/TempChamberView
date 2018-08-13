const child_process = require('child_process');
var process = child_process.fork('process-other');

console.log('Process Test');
