import { Router } from "express";
import { AuthenticateUserController } from "./controllers/AuthenticateUserController";
import { CreateMessageController } from "./controllers/CreateMessageController";
import { ensureAuthenticated } from "./middlewares/ensureAuthenticated";

const routes = Router();

routes.post("/authenticate", new AuthenticateUserController().handle);
routes.post("/messages", ensureAuthenticated, new CreateMessageController().handle);

export { routes };