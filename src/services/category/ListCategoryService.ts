import prismaClient from "../../prisma/index";

class ListCategoryService {
    async execute() {
        try {
            const categories = await prismaClient.category.findMany({
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                },
                orderBy: {
                    name: "desc",
                },
            });

            return categories;
        } catch (error) {
            throw new Error("Erro ao buscar categorias");
        }
    }
}

export { ListCategoryService };
