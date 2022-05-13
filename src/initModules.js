import userModule from "./modules/user/index.js";
import postModule from "./modules/post/index.js";
import notificationModule from "./modules/notifications/index.js";

const initModules = (app) => {
  userModule.init(app);
  postModule.init(app);
  notificationModule.init(app);
};

export default initModules;
