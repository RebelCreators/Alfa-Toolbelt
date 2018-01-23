module.exports = function (app) {
    function ToolBelt() {
    }

    ToolBelt.Router = require("./router.js")(app.Router());
    ToolBelt.Cluster = require("./cluster.js");
    return ToolBelt;
};