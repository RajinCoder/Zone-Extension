var timeZone = document.getElementById('timeZone'); // calling on it so I could manipulate it later on 
setInterval(OgTime, 100); // refresehs every milisecond I believe
document.getElementById('timeZone').value = localStorage.getItem("choice"); // retrieved it from storage and put it as value














function OgTime() {
var date = new Date();
month = (date.getMonth() + 1);
day = date.getDate();
hours = date.getUTCHours();
minutes = date.getMinutes();
seconds = date.getSeconds();
Zone();
var clock = hours >= 12 ? 'PM' : 'AM';

// aesthetics purposes
if (minutes < 10) {
    minutes = '0' + minutes;
}

// aesthetics purposes
if (seconds < 10) {
    seconds = '0' + seconds;
}

// I don't really like the military time 
if (hours == 13) {
    hours = 1;
} else if (hours == 14) {
    hours = 2;
} else if (hours == 15) {
    hours = 3;
} else if (hours == 16) {
    hours = 4;
} else if (hours == 17) {
    hours = 5;
} else if (hours == 18) {
    hours = 6;
} else if (hours == 19) {
    hours = 7;
} else if (hours == 20) {
    hours = 8;
} else if (hours == 21) {
    hours = 9;
} else if (hours == 22) {
    hours = 10;
} else if (hours == 23) {
    hours = 11;
} else if (hours == 0) {
    hours = 12;
}



var br = '<br>'; // only if I wanted to add break lines
var time = br + hours + ":" + minutes + ":" + seconds + " " + clock;
document.getElementById("work").innerHTML = time;


// This whole mess of a function is getting the value from the options and changing them to the correct time based on zone
function Zone(){
var utc = document.getElementById("timeZone").value;
localStorage.setItem("choice", utc); // Got whatever was chosen by user and kept in storage
    if (utc == 'ANAT'){
        calcTime('+12');
    } else if (utc == 'SBT') {
        calcTime('+11');
    } else if (utc == 'AEST') {
        calcTime('+10');
    } else if (utc == 'JST') {
        calcTime('+9');
    } else if (utc == 'CST-B') {
        calcTime('+8');
    } else if (utc == 'WIB') {
        calcTime('+7');
    } else if (utc == 'BST-D') {
        calcTime('+6');
    } else if (utc == 'UZT') {
        calcTime('+5');
    } else if (utc == 'GST') {
        calcTime('+4');
    } else if (utc == 'MSK') {
        calcTime('+3');
    } else if (utc == 'CEST') {
        calcTime('+2');
    } else if (utc == 'BST-L') {
        calcTime('+1');
    } else if (utc == 'GMT') {
        hours += 0;
    } else if (utc == 'CVT') {
        calcTime('-1');
    } else if (utc == 'WGST') {
        calcTime('-2');
    } else if (utc == 'ART') {
        calcTime('-3');
    } else if (utc == 'EDT') {
        calcTime('-4');
    } else if (utc == 'CDT') {
        calcTime('-5');
    } else if (utc == 'CST-G') {
        calcTime('-6');
    } else if (utc == 'PDT') {
        calcTime('-7');
    } else if (utc == 'AKDT') {
        calcTime('-8');
    } else if (utc == 'HDT') {
        calcTime('-9');
    } else if (utc == 'HST') {
        calcTime('-10');
    } else if (utc == 'NUT') {
        calcTime('11');
    } else if (utc == 'AoE') {
        calcTime('-12');
    } else if (utc == 'LINT') {
        calcTime('+14');
    } else if (utc == 'TOT') {
        calcTime('+13');
    } else if (utc == 'LHST') {
        calcTime('+10');
        minutesDiff(30);
    } else if (utc == 'ACST') {
        calcTime('+9');
        minutesDiff(30);
    } else if (utc == 'MMT') {
        calcTime('+6');
        minutesDiff(30);
    } else if (utc == 'IST') {
        calcTime('+5');
        minutesDiff(30);
    } else if (utc == 'IRDT') {
        calcTime('+4');
        minutesDiff(30);
    } else if (utc == 'NDT') {
        calcTime('-2');
        minutesDiff(30);
    } else if (utc == 'MART') {
        calcTime('-9');
        minutesDiff(30);
    } else if (utc == 'CHAST') {
        calcTime('+12');
        minutesDiff(45);
    } else if (utc == 'ACWST') {
        calcTime('+8');
        minutesDiff(45);
    } else if (utc == 'NPT') {
        calcTime('+5');
        minutesDiff(45);
    }
}

function calcTime(offset) {
   
    // convert to msec
    // add local time zone offset
    // get UTC time in msec
    currentUTC = date.getTime() + (date.getTimezoneOffset() * 60000);
   
    // create new Date object for different city
    // using supplied offset
    nd = new Date(currentUTC + (3600000*offset));
   
    // return time as a string
    hours = nd.getHours();
    return hours;

}

function minutesDiff(num) {
    // Takes in the minutes ahead for the time zone and adds it to minutes and if it is higher than 60
    // Increase the hour number and set minutes to the difference between minutes and 60
    minutes += num;
    if (minutes > 60) {
        var difference = minutes - 60;
        hours++;
        minutes = difference;
        return minutes;
    }
}

}
