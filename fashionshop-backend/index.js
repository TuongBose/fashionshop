import express from 'express'
import dotenv from 'dotenv'
import { AppRoute } from './AppRoute';
import db from "./models";
import os from 'os';

dotenv.config();

const app = express();
app.use(express.json())
express.urlencoded({ extended: true })

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next()
})

app.get('/', (req, res) => {
    // http://localhost:3000/
    res.send('Hello world hihi 11');
})

app.get('/api/healthcheck',async(req,res)=>{
    try{
        await db.sequelize.authenticate();

        const cpuLoad = os.loadavg();
        console.log('CPU Load:', cpuLoad);

        const memoryUsage = process.memoryUsage();

        const cpus = os.cpus();
        const cpuPercentage = cpuLoad[0]/cpus.length*100;

        res.status(200).json({
            status:'OK',
            database:'Connected',
            cpuLoad:{
                '1min':cpuLoad[0].toFixed(2),
                '5min':cpuLoad[1].toFixed(2),
                '15min':cpuLoad[2].toFixed(2),
                'cpuPercentage':cpuPercentage.toFixed(2)+'%'
            },
            memoryUsage:{
                rss:(memoryUsage.rss/1024/1024).toFixed(2)+' MB',
                heapTotal:(memoryUsage.heapTotal/1024/1024).toFixed(2)+' MB',
                heapUsed:(memoryUsage.heapUsed/1024/1024).toFixed(2)+' MB',
                external:(memoryUsage.external/1024/1024).toFixed(2)+' MB',
            }
        })
    }catch(error){
        res.status(500).json({
            status:'Failed',
            message:'Health check failed',
            error:error.message
        })
    }
})

const port = process?.env?.PORT ?? 3000;
AppRoute(app);
app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})
