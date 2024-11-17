const express = require('express');
const cors = require('cors');
const connection = require('./connection');
const app = express();
const userRouter = require('./routes/user');
const categoryRouter = require('./routes/category');
const productRouter = require('./routes/product');
const billRouter = require('./routes/bill');
const dashboardRouter = require('./routes/dashboard');


app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/user', userRouter);
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/bill', billRouter);
app.use('/dashboard', dashboardRouter);

module.exports = app;