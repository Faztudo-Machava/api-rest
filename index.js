const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')

const productRoutes = require('./routes/products');
const pedidoRoutes = require('./routes/pedidos');
const usuariosRoutes = require('./routes/usuarios')

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Acess-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept, Authorizathion');

    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, GET, DELETE');
        return res.status(200).send({});
    }

    next();
})

app.use('/produtos', productRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/usuarios', usuariosRoutes);

//CASO NENHUMA ROTA SEJA ENCONTRADA ACESSA ESSE METÓDO
app.use((req, res, next)=>{
    const erro = new Error('Rota não encontrada');
    erro.status = 404;
    next(erro);
})

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message
        }
    })
})

module.exports = app
