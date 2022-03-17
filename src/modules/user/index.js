const userRoutes = require('./routes');


const userModule = {
    init: (app) => {
        app.use("/api/v1", userRoutes);
        console.log('[module]: user module loaded');
    }
}

module.exports = userModule;