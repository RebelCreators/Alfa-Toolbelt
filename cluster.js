const cluster = require('cluster');
const fs = require("fs");
const debug = require('debug')("alfa-toolbelt");

module.exports = function (callback) {
// Pidfile contains master process PID.
    var pidfile = 'master.pid';

// Map of workers (PID -> worker).
    var workers = {};

    if (cluster.isMaster) {
        process.title = "com.rebelcreators.alfa.master";
        const cpuCount = require('os').cpus().length;
        for (var i = 0; i < cpuCount; i += 1) {
            var worker = cluster.fork();
            var pid = worker.process.pid;
            workers[pid] = worker;
        }

        cluster.on('died', function (worker) {
            debug('Worker ' + process.pid + ' died.');
            // Remove dead worker.
            delete workers[process.pid];

            if (worker.exitedAfterDisconnect) {
                return;
            }

            // Restart on worker death.

            debug('Worker ' + process.pid + ' restarting.');
            worker = cluster.fork();
            workers[process.pid] = worker;
        });

        // Attach signal handler to kill workers
        // when master is terminated.

        function cleanup() {
            debug('Master stopping.');

            for (var pid in workers) {
                debug('Kill worker: ' + pid);
                process.kill(pid)
            }

            // Remove pidfile.

            fs.unlinkSync(pidfile);
            workers = {};

            process.exit(0);
        }

        // Master can be terminated by either SIGTERM
        // or SIGINT. The latter is used by CTRL+C on console.

        process.on('SIGTERM', cleanup);
        process.on('SIGINT', cleanup);

        // Write pidfile.

        fs.writeFileSync(pidfile, process.pid);
    } else {

        process.title = "com.rebelcreators.alfa.worker";
        process.on('SIGTERM', function () {
            debug('Stopping worker ' + process.pid);
        });

        debug('Worker ' + process.pid + ' started.');

        callback();
    }
};