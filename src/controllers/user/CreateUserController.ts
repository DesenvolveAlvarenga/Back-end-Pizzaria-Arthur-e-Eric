import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";


class CreateUserController {
    async handle(req: Request, res: Response) {

        const { name, email, password } = req.body;



        const createUSerService = new CreateUserService();

        const user = await createUSerService.execute({
            name: name,
            email: email,
            password: password
        });



        res.json(user)
    }
}

export { CreateUserController }
