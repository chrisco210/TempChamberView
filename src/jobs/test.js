console.log('TEST INSTRUCTION EXECUTED');
process.argv.forEach((arg) => {
    console.log(arg);
});

setTimeout(() => {console.log('SUPERLONGOPERATIONTHATTAKES30SECONDS NaM----------------------------------------------------------------');}, 60000);
console.log('TEST INSTRUCTION ENDED');

module.exports = this;