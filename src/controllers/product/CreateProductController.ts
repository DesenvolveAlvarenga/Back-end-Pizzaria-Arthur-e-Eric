// import { Request, Response } from 'express'
// import { CreateProductService } from '../../services/product/CreateProductService'

// class CreateProductController {
//     async handle(req: Request, res: Response) {

//         const { name, description, price, category_id } = req.body;

//         if (!req.file) {
//             return res.status(400).json({ error: "A iamgem do produto é obrigadtoria" });
//         }

//         console.log("==================")
//         console.log(req.file)
//         console.log("==================")



//         const createProduct = new CreateProductService();

//         const product = await createProduct.execute({
//             name,
//             description,
//             price: parseInt(price),
//             category_id,
//             imageBuffer: req.file.buffer,
//             imageName: req.file.originalname
//         });

//         res.json(product);
//     }
// }

// export { CreateProductController }


import { Request, Response } from "express";
import { CreateProductService } from "../../services/product/CreateProductService";

class CreateProductController {
  async handle(req: Request, res: Response) {
    const { name, price, description, category_id } = req.body;

    if (!req.file) {
      throw new Error("A imagem do produto é obrigatória");
    }

    const createProduct = new CreateProductService();

    const product = await createProduct.execute({
      name: name,
      price: parseInt(price), // Converte string para Int para ter o valor em centavos
      description: description,
      category_id: category_id,
      imageBuffer: req.file.buffer,
      imageName: req.file.originalname,
    });

    res.json(product);
  }
}

export { CreateProductController };
