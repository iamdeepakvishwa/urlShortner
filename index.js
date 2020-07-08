const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const {nanoid} = require('nanoid');
require('dotenv').config()

const db =monk(process.env.MONGODB_URI);
const urls = db.get('urls');
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();
app.enable('trust proxy');


app.use(morgan('common'));
app.use(helmet());
app.use(express.json());
app.use(express.static('./public'));

const notFoundPath = path.join(__dirname, 'public/404.html');

app.get('/:id',async(req,res,next)=>{
    // Redirect to the Url
    const {id: slug} = req.params;
    try{
        const url = await(urls.findOne({slug}));
        if(url){
            return res.redirect(url.url);
        }
        return res.status(404).sendFile(notFoundPath);
    }catch(error){
        return res.status(404).sendFile(notFoundPath);
    }
});

const schema = yup.object().shape({
    slug : yup.string().trim().matches(/^[\w\-]+$/i),
    url: yup.string().url().required(),
})

app.post('/url', slowDown({
        windowMs: 30 * 1000,
        delayAfter: 1,
        delayMs: 500,
    }),rateLimit({
        windowMs: 30 * 1000,
        max: 1,
    }),async(req,res,next)=>{
        // create a short url
        let {slug,url} = req.body;
        try{
            await schema.validate({
                slug,
                url,
            });
            if (url.includes('vsg.sh')) {
                throw new Error('Stop it. 🛑');
            }
            if(!slug){
                slug = nanoid(5);
            }
            else{
                const existing  = await urls.findOne({slug});
                if(existing){
                    throw new Error('slug in use ');
                }
            }
            slug = slug.toLowerCase();
            const newUrl = {
                url,
                slug,
            }
            const created = await urls.insert(newUrl);
            res.json({
                created
            });
        }catch(error){
            next(error);
        }
});

app.use((req, res, next) => {
  res.status(404).sendFile(notFoundPath);
});

app.use((error,req,res,next)=>{
    if(error.status){
        res.status(error.status);
    }
    else{
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV==='PRODUCTION'? '{🥞}' :error.stack,
    });
});

const port = process.env.PORT || 4999;

app.listen(port,()=>{
    console.log(`Listening at http://localhost:${port}`)
})
