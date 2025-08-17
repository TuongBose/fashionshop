import express from 'express'
import dotenv from 'dotenv'
import { AppRoute } from './AppRoute';

dotenv.config();

const app = express();
app.use(express.json())
express.urlencoded({extended:true})

app.get('/', (req, res) => {
    // http://localhost:3000/
    res.send('Hello world hihi 11');
})

const port =process?.env?.PORT ?? 3000;
AppRoute(app);
app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})
