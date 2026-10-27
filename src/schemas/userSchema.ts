import { z } from 'zod'

export const createUserSchema = z.object({
    body: z.object({
        name: z.string({ message: "O nome precisa ser um texto" }).min(3, { message: "O nome precisa ter no minimo 3 letras" }),
        email: z.email({ message: "Precisa ser um email Válido" }),
        password: z.string({ message: "A senha é obrigatoria" }).min(6, { message: "A senha precisa conter no mínimo 6 caracteres" })
    })

})