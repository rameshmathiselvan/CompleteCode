var pw = require('process-watch');
var exec=require('child_process').exec;
var moment = require('moment');
var fs = require('fs');


// optional parentPid to ensure process uniqueness
var process = pw.watch('server.js')
    .error(function(err) {
        console.log('1');
        console.log(err);
        // an error occurred
    })
    .started(function() {
        console.log('Please go to localhost:3000/');
        // process started
    })
    .killed(function() {
        console.log('3');

        exec('node server.js',function(err,data){
            console.log(err);
            console.log(data);
        });
        // process was killed
    })
    .restarted(function() {
        console.log('4');
        // process has been restarted
    })
    .start(100);  // watch every 100 milliseconds (default)

exec('node server.js',function(err,data){
    console.log(err);
    console.log(data);
});

// process.kill();
// process.unwatch();