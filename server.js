const dotenv = require("dotenv")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const paymentRouter = require("./routes/paymentRouter")
const app = express()
const PORT = process.env.PORT || 8000

app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config({
    path: "./config.env"
})

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: [],
    maxAge: 3600,
};

app.use(cors(corsOptions));
app.use(express.json());

const DB = process.env.DATABASE
const mongooseOptions = {
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    minPoolSize: 3,
};

mongoose.set('strictQuery', true)

mongoose.connect(DB, mongooseOptions).then(() => {
    console.log("Database Connected !")
})

mongoose.connection.on("error", (error) => {
    console.log(error)
})


app.use("/api/payment", paymentRouter);
app.all("*", (req, res) => {
    res.status(404).json({
        message: `Can't find ${req.originalUrl} on this server!`,
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT} port`)
})
