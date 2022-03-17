const postModule = require("./modules/post");
const userModule = require("./modules/user");


const initModules = (app) => {
    userModule.init(app);
    postModule.init(app);
}

module.exports = initModules;