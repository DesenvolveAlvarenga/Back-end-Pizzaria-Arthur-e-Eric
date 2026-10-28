import prismaClient from "../../prisma"
import { compare } from "bcryptjs"
import { sign } from 'jsonwebtoken'

interface AuthServiceProps {
    email: string,
    password: string
}

class AuthUserService {
    async execute({ email, password }: AuthServiceProps) {
        const user = await prismaClient.user.findFirst({
            where: {
                email: email
            }
        })

        if (!user) {
            throw new Error("Email/Senha é Obrigatório")
        }

        const passwordMatch = await compare(password, user.password)

        if (!passwordMatch) {
            throw new Error("Email/Senha é Obrigatório")
        }

        // GERAR TOKEN JWT
        const token = sign({
            name: user.name,
            email: user.email
        },
            process.env.JWT_SECRET as string, {
                subject: user.id,
                expiresIn: "30d"
        })

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, 
            token: token,
        }
    }
}

export { AuthUserService }