import cors from 'cors'
import 'dotenv/config';
import { router } from './routes';

import express from 'express'

const app = express();

app.use(express.json())
app.use(cors());
app.use(router)

const PORT = process.env.PORT! || 3333;

app.listen(PORT, () => {
    console.log("SEVIDOR RODANDO NA PORTA " + PORT + " 🚀 ") 
})