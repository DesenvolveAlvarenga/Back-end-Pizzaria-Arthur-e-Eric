import { Router } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController';
import { createUserSchema, authUserSchema } from './schemas/userSchema';
import { validateSchema,  } from './middlewares/validateSchema';
import { AuthUserController } from './controllers/user/AuthUserController'


const router = Router();

// ROTAS USERS

router.post("/users", validateSchema(createUserSchema), new CreateUserController().handle)

router.post("/session", validateSchema(authUserSchema), new AuthUserController().handle)

export { router }