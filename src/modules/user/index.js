const userRoutes = require('./routes');

const router = ("/api/v1", userRoutes);

const userModule = {
    init: (app) => {
        app.use(router);
        console.log('[module]: user module loaded');
    }
}

module.exports = userModule;