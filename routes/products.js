const express = require('express');
const  router  = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer')
const upload = multer({ dest: 'uploads/'})
require('dotenv/config')
const Login = require('../middleware/login')

//RETORNA A LISTA DE PRODUTOS
router.get('/', (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({
            error: error
        })}
        conn.query( 
            'SELECT * FROM PRODUTO',
            (error, resultado, fields)=>{
                conn.release();
                if(error){
                    return res.status(500).send({error: error})
                }
                const response = {
                    quantidade: resultado.length,
                    produtos: resultado.map(prod =>{
                        return {
                            Id_produto: prod.id_produto,
                            Nome: prod.nome,
                            Preço: prod.preco,
                            request:{
                                tipo: 'GET',
                                descrição: 'Retorna todos os produtos',
                                url: process.env.URL+'produtos/'+prod.id_produto
                            }
                        }
                    })
                }
                return res.status(200).send({
                    response
                })
            }
        )
    })
});

//ADICIONA UM PRODUTO
router.post('/', Login.obrigatorio, upload.single('produto.imagem') ,(req, res, next)=>{
    console.log(req.file)
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({
            error: error
        })}
        conn.query(
            'INSERT INTO produto (nome, preco) VALUES(?,?)',
            [req.body.nome, req.body.preco],
            (error, resultado, field)=>{
                conn.release();
                if(error){
                    return res.status(500).send({
                        error: error,
                        response: null
                    })
                }
                const response = {
                    mensagem: 'Produto criado com sucesso',
                    produtoCriado:{
                        Id_produto: resultado.id_produto,
                        Nome: req.body.nome, 
                        Preco: req.body.preco,
                        request:{
                            tipo: 'POST',
                            descrição: 'Adiciona um produto',
                            url: process.env.URL+'produtos'
                        }
                    } 
                }
                return res.status(201).send({
                    response
                })
            }
        )
    })

})

//RETORNA DETALHES DE UM PRODUTO ESPECÍFICO
router.get('/:prodId', (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({
            error: error
        })}
        conn.query(
            'SELECT * FROM PRODUTO WHERE ID_PRODUTO = ?',
            [req.params.prodId],
            (error, resultado, fields)=>{
                conn.release();
                if(error){
                    return res.status(500).send({error: error})
                }
                if(resultado.length == 0){return res.status(404).send({mensagem : "Não foi encontrado nenhum produto de id "+req.params.prodId})}

                const response = {
                    Produto:{
                        Id_produto: resultado[0].id_produto,
                        Nome: resultado[0].nome,
                        Preco: resultado[0].preco,
                        request:{
                            tipo: 'GET',
                            descrição: 'Retorna os detalhes de um produto',
                            url: process.env.URL+'produtos'
                        }
                    }
                }
                return res.status(200).send({
                    response
                })
            }
        )
    })
})

//ATUALIZA DADOS DE UM DETERMINADO PRODUTO
router.patch('/', Login.obrigatorio, (req, res, next)=>{
    // res.status(201).send({
    //     mensagem : "Produto atualizado."
    // })
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({
            error: error
        })}
        conn.query(
            `UPDATE PRODUTO SET NOME  = ?, 
                                PRECO = ?
                     WHERE ID_PRODUTO = ?`,
            [   
                req.body.nome, 
                req.body.preco,
                req.body.id_produto
            ],
            (error, resultado, field)=>{
                conn.release();
                if(error){
                    return res.status(500).send({
                        error: error,
                        response: null
                    })
                }
                const response = {
                    mensagem: "Produto atualizado",
                    Produto:{
                        Id_produto: req.body.id_produto,
                        Nome: req.body.nome,
                        Preco: req.body.preco,
                        request:{
                            tipo: 'GET',
                            descrição: 'Atualiza um determinado produto',
                            url: process.env.URL+'produtos/'+req.body.id_produto
                        }
                    }
                }
                return res.status(200).send({
                    response
                })
            }
        )
    })
})

//ELIMINA UM PRODUTO
router.delete('/:id_produto', Login.obrigatorio, (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({
            error: error
        })}
        conn.query(
            `DELETE FROM PRODUTO WHERE ID_PRODUTO = ?`,
            [
                req.params.id_produto
            ],
            (error, resultado, field)=>{
                conn.release();
                if(error){
                    return res.status(500).send({
                        error: error,
                        response: null
                    })
                }
                return res.status(200).send({
                    mensagem: "Produto excluido."
                })
            }
        )
    })
})


module.exports = router

