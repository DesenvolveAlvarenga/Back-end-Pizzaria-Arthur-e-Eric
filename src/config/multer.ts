import multer from "multer";

// Usar o memory storage do multer para armazenar os arquivos em memória e enviar para o Cloudinary

export default {
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 4 * 1024 * 1024, // Limite de tamanho do arquivo em bytes (5MB)
    },
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Tipo de arquivo não permitido, use imagens nos formatos JPEG, JPG ou PNG"), false);
        }
}
}