const http = require('http')
const app = require('./index')
require('dotenv/config')


const port = process.env.SERVER_PORT
const server = http.createServer(app)

server.listen(port, (req, res)=>{
    console.log('Running server in ' + port)
})