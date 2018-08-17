var fs = require('fs');
var path = require('path');
var Mustache = require('mustache');



var options = {replace: false, production: true, displayHelp: false, invalidArgument: false};

if(process.argv.length <= 2) {
    console.log('Must specify API key to render with. Exiting...');
    process.exit(1);
}

var webindex = fs.readFileSync(path.join(__dirname, '../public/javascripts/webindex.js'));

var insertIndex = Mustache.render(webindex.toString(), {api_key_insert: process.argv[2]});

fs.writeFileSync(path.join(__dirname, '../public/javascripts/webindex.render.js'), insertIndex);

console.log('Done');