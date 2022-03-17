const postRoutes = require('./routes');

const router = ("/api/v1", postRoutes);

const postModule = {
    init: (app) => {
        app.use(router);
        console.log('[module]: post module loaded');
    }
}

module.exports = postModule;