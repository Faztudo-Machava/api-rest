const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv/config')

router.post('/cadastro', (req, res, next) =>{
    mysql.getConnection((error, conn)=>{
        if(error){res.status(500).send({ error: error})}
        conn.query('SELECT * FROM USUARIO WHERE EMAIL = ?', [req.body.email], (error, resultado)=>{
            if(resultado.length > 0){
                return res.status(509).send({mensagem : "Esse usuario já existe."})
            } else{
                bcrypt.hash(req.body.password, 10, (errBcrypt, hash)=>{
                    if(errBcrypt){return res.status(500).send({error : errBcrypt})}
                    conn.query(
                        'INSERT INTO USUARIO (nome, email, password) VALUES(?, ?, ?)',
                        [req.body.nome, req.body.email, hash],
                        (error, resultado, field)=>{
                            conn.release();
                            if(error){return res.status(500).send({error : error})}
                            const response = {
                                mensagem : "Usuario inserido com  sucesso",
                                Usuario :{
                                    id_usuario: resultado.insertId,
                                    nome: req.body.nome,
                                    email: req.body.email
                                }
                            }
                            return res.status(201).send(response)
                        }
                    )
                })
            }
        })
    })
})

router.post('/login', (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({error : error})}
        const query = 'SELECT * FROM USUARIO WHERE EMAIL = ?';
        conn.query(
            query,
            [req.body.email],
            (error, resultado, field)=>{
                conn.release();
                if(error){return res.status(500).send({error : error})}
                if(resultado.length < 1){
                    return res.status(401).send({mensagem : 'Falha na autenticação'})
                }
                bcrypt.compare(req.body.password, resultado[0].password, (err, result)=>{
                    if(err){
                        return res.status(401).send({mensagem : 'Falha na autenticação'})
                    }
                    if(result){
                        const token = jwt.sign({
                            id_usuario : resultado[0].id_user,
                            nome : resultado[0].nome, 
                            email : resultado[0].email
                        }, process.env.JWT_KEY,
                        {
                            expiresIn : "1h"
                        })
                        return res.status(200).send({
                            mensagem : 'Autenticado com sucesso',
                            token : token
                        })
                    }
                    return res.status(401).send({mensagem : 'Falha na autenticação'})
                })
            }
        )

    })
})

module.exports = router;