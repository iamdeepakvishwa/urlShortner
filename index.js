const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

app.use(morgan('tiny'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

app.get('/url/:id',(req,res)=>{
    // get a Short the Url by id
});

app.get('/:id',(req,res)=>{
    // Redirect to the Url
})

app.post('/url',(req,res)=>{
    // create a short url
})

const port = process.env.PORT || 4999;

app.listen(port,()=>{
    console.log(`Listening at http://localhost:${port}`)
})
