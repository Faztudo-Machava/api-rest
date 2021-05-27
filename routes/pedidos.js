const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
require('dotenv/config')

//RETORNA A LISTA DE PEDIDOS
router.get('/', (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({
            error: error
        })}
        conn.query(
            'SELECT * FROM PEDIDO INNER JOIN PRODUTO ON PEDIDO.ID_PRODUTO = PRODUTO.ID_PRODUTO',
            (error, resultado, fields)=>{
                if(error){
                    return res.status(500).send({error: error})
                }
                const response = {
                    quantidade: resultado.length,
                    pedidos: resultado.map(pedido =>{
                        return {
                            id_pedido: pedido.id_pedido,
                            Quantidade: pedido.quantidade,
                            Produto:{
                                id_produto : pedido.id_produto,
                                nome : pedido.nome,
                                preco : pedido.preco
                            },
                            request:{
                                tipo: 'GET',
                                descrição: 'Retorna todos os pedidos',
                                url: process.env.URL+'pedidos/'+pedido.id_pedido
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
})

//ADICIONA UM PRODUTO
router.post('/', (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({error: error})}
        conn.query('SELECT * FROM PRODUTO WHERE ID_PRODUTO = ?', [req.body.id_produto],(error, resultado, field)=>{
            if(error){return res.status(500).send({error: error})}
            if(resultado.length == 0){return res.status(404).send({error : "Produto não encontrado."})}
            conn.query(
                'INSERT INTO pedido (id_produto, quantidade) VALUES(?,?)',
                [req.body.id_produto, req.body.quantidade],
                (error, resultado, field)=>{
                    conn.release();
                    if(error){
                        return res.status(500).send({
                            error: error,
                            response: null
                        })
                    }
                    const response = {
                        mensagem: 'Pedido criado com sucesso',
                        produtoCriado:{
                            id_pedido: resultado.id_pedido,
                            Id_produto: req.body.id_produto,
                            Quantidade: req.body.quantidade,
                            request:{
                                tipo: 'POST',
                                descrição: 'Adiciona um pedido',
                                url: process.env.URL+'pedidos'
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
})

//RETORNA DETALHES DE UM PRODUTO EM ESCIFICO
router.get('/:pedidoId',(req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({
            error: error
        })}
        conn.query(
            'SELECT * FROM PEDIDO WHERE ID_PEDIDO = ?',
            [req.params.pedidoId],
            (error, resultado, fields)=>{
                if(error){
                    return res.status(500).send({error: error})
                }
                if(resultado.length == 0){return res.status(404).send({mensagem : "Não foi encontrado nenhum pedido de id "+req.params.pedidoId})}

                const response = {
                    Produto:{
                        id_pedido: resultado[0].id_pedido,
                        Id_produto: resultado[0].id_produto,
                        Quantidade: resultado[0].quantidade,
                        request:{
                            tipo: 'GET',
                            descrição: 'Retorna os detalhes de um pedido',
                            url: process.env.URL+'pedidos'
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

//ELIMINA UM PEDIDO
router.delete('/:pedidoId', (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({
            error: error
        })}
        conn.query(
            `DELETE FROM PEDIDO WHERE ID_PEDIDO = ?`,
            [
                req.params.pedidoId
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
                    mensagem: "Pedido excluido com sucesso."
                })
            }
        )
    })
})


module.exports = router