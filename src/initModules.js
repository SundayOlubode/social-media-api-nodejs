import userModule from './modules/user/index.js';
import postModule from './modules/post/index.js';


const initModules = (app) => {
    userModule.init(app);
    postModule.init(app);
}


export default initModules;