const express = require("express")
const app = express()

// JSON Middleware
app.use(express.json())

// Routes
const dbRouter = require('./routes/dbRoute')

app.use('/db', dbRouter)

// Server Setup
app.listen(4000, ()=> {
    console.log('Server started')
})