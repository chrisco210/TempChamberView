var latestData = {};
var latestInstructions = [];
var runningInstruction = {};

var KEY = '{{api_key_insert}}';

var operationHTML = {};

var template = '<p><%= JSON.stringify(data) %></p>';
var TEMPLATE_TAB = '<li class="tab col s3"><a href="#<%=data.name%>" class="blue-text"><%=data.name%></a></li>';
var TEMPLATE_CARD = '<div class="col s12 " id="<%=data.name%>"><h3 class="center-align"><%=data.name%></h3><p class="center-align"><%= data.value + \' \' + data.units%></p></div>';
var TEMPLATE_COLLAPSE = '<li><div class="collapsible-header"><%=op.instruction%></div><div class="collapsible-body"><span><%=JSON.stringify(op.args)%></span></div></li>';
var TEMPLATE_RUNNING = '<p><%=JSON.stringify(running)%></p>';
var sensorTypes = ['temperature', 'humidity',];

var first = true;

function updateSensorData() {
    console.log('Updating sensor data');
    var request = new XMLHttpRequest();

    request.open('POST', '/api/sensors', true);
    request.setRequestHeader('authorization', KEY);
    request.send();


    //retrieve sensor data from api
    request.onreadystatechange = function(e) {
        if(request.readyState == 4 && request.status == 200) {
            latestData = JSON.parse(request.responseText);

            console.log(latestData);

            if(latestData.error) {
                console.error(latestData.error);
            }
            var totalCards = '';
            var totalTabs = '';
            latestData.data.forEach(function(elem) {
                totalCards += ejs.render(TEMPLATE_CARD, {data: elem});
                totalTabs += ejs.render(TEMPLATE_TAB, {data: elem});
                
            });

            //Create tabs and containers
            if(first) {
                $('#sensor-tabs').html(totalTabs);
                $('#tab-container').html(totalCards);
                first = false;
            } else {
                $('#tab-container').html(totalCards);
            }
            $('.tabs').tabs();
            
        
        } else {
            console.log(e);
        }
    };
}

//Update to most recent instructions
function updateInstructionQueue() {
    console.log('Getting most recent instruction queue');

    var request = new XMLHttpRequest();

    request.open('POST', '/api/instructions/recent', true);
    request.setRequestHeader('authorization', KEY);
    request.send();

    request.onreadystatechange = function(e) {
        if(request.readyState == 4 && request.status == 200) {
            console.log(request);
            latestInstructions = JSON.parse(request.responseText);
            
            console.log('Latest Instructions: ' + JSON.stringify(latestInstructions));

            var list = '';


            for(var ii = latestInstructions.length - 1; ii >= 0; ii--) {
                list += ejs.render(TEMPLATE_COLLAPSE, {op: latestInstructions[ii]});
            }

            console.log(list);

            if(list === '') {
                $('#instruction-display').html(ejs.render(TEMPLATE_COLLAPSE, {op: {instruction: 'No new instructions', args: []}}));
            } else {
                $('#instruction-display').html(list);
            }
        } else {
            console.log(e);
        }
    };

    var runningReq = new XMLHttpRequest();

    runningReq.open('POST', '/api/instructions/running', true);
    runningReq.setRequestHeader('authorization', KEY);
    runningReq.send();

    runningReq.onreadystatechange = function(e) {
        if(runningReq.readyState == 4 && runningReq.status == 200) {
            console.log(runningReq);
            runningInstruction = JSON.parse(runningReq.responseText);
            var render = ejs.render(TEMPLATE_RUNNING, {running: runningInstruction});
            $('#running-instruction').html(render);
        } else {
            console.log(e);
        }
    };
}

//Function to handle new selection in dropdown
function handleChange() {
    
    var value = '' + document.getElementById('operation-selector').value;
    
    if(operationHTML[value] === undefined) {
        $('#args-input').html('');
    } else {
        $('#args-input').html(operationHTML[value]);
    }

    $('.collapsible').collapsible();
    $('.tooltipped').tooltip();

}

$(document).ready(function() {

    $('.operation-select-option').toArray().forEach(function(e) {
        operationHTML[e.value] = $('#' + e.value).html();
    });
    

    $('#args-input').html('');
    
    //initialize all select elements
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);


    //initialize sensor data update
    updateSensorData();
    //get the most recent instruction queue
    updateInstructionQueue();

    //Initialize the dropdown arg switching
    handleChange();

    //Update once every 60 seconds
    setInterval(updateSensorData(), 60000);
    $('.tooltipped').tooltip();

});
