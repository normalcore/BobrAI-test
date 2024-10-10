const express = require("express")
const app = express()
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');



// JSON Middleware
app.use(express.json())

// Routes
const logRouter = require('./routes/logRoute')

app.use('/', logRouter)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Server Setup
app.listen(5000, ()=> {
    console.log('Server started')
})