const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { connectDB } = require('./config/database');
const app = express();
const {run }= require('./lib/apiResponse')
app.use(cors())
app.use(express.json());
const port = 3000;
connectDB();
run(app).catch(console.dir);
app.listen(port,() => {
    console.log("Server is runnig on port:",port);;
})

module.exports = app;