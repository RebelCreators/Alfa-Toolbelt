module.exports = function (express) {
    function ToolBelt() {
    }

    ToolBelt.Router = require("./router.js")(express.Router());
    ToolBelt.Cluster = require("./cluster.js");
    return ToolBelt;
};