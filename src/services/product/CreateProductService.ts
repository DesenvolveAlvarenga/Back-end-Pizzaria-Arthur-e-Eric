// import prismaClient from "../../prisma";
// import cloudinary from "../../config/cloudinary";
// import { Readable } from 'stream'

// interface CreateProductProps {
//     name: string;
//     price: number;
//     description: string;
//     category_id: string;
//     imageBuffer: Buffer;
//     imageName: string;
// }

// class CreateProductService {
//     async execute({ name, price, description, category_id, imageBuffer, imageName }: CreateProductProps) {

//         const categoryExists = await prismaClient.category.findFirst({
//             where: {
//                 id: category_id
//             }
//         })

//         if (!categoryExists) {
//             throw new Error("Categoria não existe")
//         }

//         let bannerUrl = "";

//         try {

//             const result = await new Promise<any>((resolve, reject) => {

//                 const uploadStream = cloudinary.uploader.upload_stream({
//                     folder: "products",
//                     resource_type: "image",
//                     public_id: `${Date.now()}-${imageName.split(".")[0]}`
//                 }, (error, result) => {
//                     if (error) reject(error);
//                     else resolve(result);
//                 })

//                 const bufferStream = Readable.from(imageBuffer)
//                 bufferStream.pipe(uploadStream)
//             })

//             bannerUrl = result.secure_url;



//         } catch (error) {
//             console.log(error)
//             throw new Error("Erro ao fazer upload da imagem")
//         }

//         const product = await prismaClient.product.create({
//             data: {
//                 name: name,
//                 price: price,
//                 description: description,
//                 banner: bannerUrl,
//                 category_id: category_id
//             }, select: {
//                 id: true,
//                 name: true,
//                 price: true,
//                 description: true,
//                 category_id: true,
//                 banner: true,
//                 created_at: true,
//             }
//         })

//         return product;
//     }
// }

// export { CreateProductService }




import { Readable } from "node:stream";
import cloudinary from "../../config/cloudinary";
import prismaClient from "../../prisma/index";

interface CreateProductServiceProps {
  name: string;
  price: number;
  description: string;
  category_id: string;
  imageBuffer: Buffer;
  imageName: string;
}

class CreateProductService {
  async execute({
    name,
    price,
    description,
    category_id,
    imageBuffer,
    imageName,
  }: CreateProductServiceProps) {
    const categoryExists = await prismaClient.category.findFirst({
      where: {
        id: category_id,
      },
    });

    if (!categoryExists) {
      throw new Error("Categoria não encontrada!");
    }

    // ENVIAR PRO CLOUDINARY SALVAR A IMAGEM E PEGAR A URL
    let bannerUrl = "";

    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "products",
            resource_type: "image",
            public_id: `${Date.now()}-${imageName.split(".")[0]}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Criar o stream do buffer e fazer pipe para o cloudinary
        const bufferStream = Readable.from(imageBuffer);
        bufferStream.pipe(uploadStream);
      });

      bannerUrl = result.secure_url;
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao fazer o upload a imagem!");
    }

    const product = await prismaClient.product.create({
      data: {
        name: name,
        price: price,
        description: description,
        banner: bannerUrl,
        category_id: category_id,
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        category_id: true,
        banner: true,
        createdAt: true,
      },
    });

    return product;
  }
}

export { CreateProductService };
