var latestData = {};
var latestInstructions = [];

var template = '<p><%= JSON.stringify(data) %></p>';
var TEMPLATE_TAB = '<li class="tab col s3"><a href="#<%=data.name%>" class="blue-text"><%=data.name%></a></li>';
var TEMPLATE_CARD = '<div class="col s12 " id="<%=data.name%>"><h3><%=data.name%></h3><p><%= data.value + \' \' + data.units%></p></div>';


var sensorTypes = ['temperature', 'humidity',];

var first = true;

function updateSensorData() {
    console.log('Updating sensor data');
    var request = new XMLHttpRequest();

    request.open('POST', '/api/sensors', true);
    request.setRequestHeader('authorization', 'tempkey');
    request.send();

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

function updateInstructionQueue() {
    console.log('Getting most recent instruction queue');

    var request = new XMLHttpRequest();

    request.open('POST', '/api/instructions/recent', true);
    request.setRequestHeader('authorization', 'tempkey');
    request.send();

    request.onreadystatechange = function(e) {
        if(request.readyState == 4 && request.status == 200) {
            latestData = JSON.parse(request.responseText);

            console.log(latestData);

            $('#queue-display').html(JSON.stringify(latestData));
        } else {
            console.log(e);
        }
    };
}

function displayArgs(id) {
    console.log(id);
}

$(document).ready(function() {

    $('select').formSelect();

    updateSensorData();
    updateInstructionQueue();

    //Update once every 60 seconds
    setInterval(updateSensorData(), 60000);
});
