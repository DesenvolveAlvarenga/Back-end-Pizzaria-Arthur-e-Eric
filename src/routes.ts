import { Router } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController';
import { createUserSchema, authUserSchema } from './schemas/userSchema';
import { validateSchema, } from './middlewares/validateSchema';
import { AuthUserController } from './controllers/user/AuthUserController'
import { DetailUserController } from './controllers/user/DetailUserController';
import { isAuthenticated } from './middlewares/isAuthenticated';
import { CreateCategoryController } from './controllers/category/CreateCategoryController';
import { isAdmin } from './middlewares/isAdmin';
import { createCategorySchema } from './schemas/categorySchemas';


const router = Router();

// ROTAS USERS

router.post("/users", validateSchema(createUserSchema), new CreateUserController().handle)

router.post("/session", validateSchema(authUserSchema), new AuthUserController().handle)

router.get("/me", isAuthenticated, new DetailUserController().handle)

// ROTAS CATEGORIES

router.post("/category", isAuthenticated, isAdmin, validateSchema(createCategorySchema), new CreateCategoryController().handle)

export { router }