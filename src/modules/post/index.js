const postRoutes = require('./routes');


const postModule = {
    init: (app) => {
        app.use("/api/v1", postRoutes);
        console.log('[module]: post module loaded');
    }
}

module.exports = postModule;