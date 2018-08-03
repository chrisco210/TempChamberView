let latestData = {};

function updateSensorData() {
    var request = new XMLHttpRequest();

    request.setRequestHeader('authentication', 'tempkey');
    request.open('POST', '/api/sensors', true);
    request.send();

    request.onreadystatechange = (e) => {
        if(request.readyState == 4 && request.status == 200) {
            latestData = JSON.parse(request.responseText);
        } else {
            console.error('error encountered');
        }

    };
}

