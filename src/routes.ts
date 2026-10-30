import { Router } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController';
import { createUserSchema, authUserSchema } from './schemas/userSchema';
import { validateSchema, } from './middlewares/validateSchema';
import { AuthUserController } from './controllers/user/AuthUserController'
import  multer  from 'multer';
import UploadConfig from './config/multer';
import { DetailUserController } from './controllers/user/DetailUserController';
import { isAuthenticated } from './middlewares/isAuthenticated';
import { CreateCategoryController } from './controllers/category/CreateCategoryController';
import { ListCategoryController } from './controllers/category/ListCategoryController';
import { isAdmin } from './middlewares/isAdmin';
import { createCategorySchema } from './schemas/categorySchemas';
import { CreateProductController } from './controllers/product/CreateProductController';



const router = Router();

const upload = multer(UploadConfig)

// ROTAS USERS

router.post("/users", validateSchema(createUserSchema), new CreateUserController().handle)

router.post("/session", validateSchema(authUserSchema), new AuthUserController().handle)

router.get("/me", isAuthenticated, new DetailUserController().handle)

// ROTAS CATEGORIES

router.get("/category", isAuthenticated, new ListCategoryController().handle)

router.post("/category", isAuthenticated, isAdmin, validateSchema(createCategorySchema), new CreateCategoryController().handle)

// ROTAS PRODCUTS

router.post("/product", isAuthenticated, isAdmin, upload.single("file"), new CreateProductController().handle);

export { router }