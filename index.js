const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ygyoxnw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const runMongo = async () =>{
    try{
        const serviceCollection =  client.db("reviewdb").collection("service")
        const reviewCollection =  client.db("reviewdb").collection("review")
        // get requests
        app.get("/service",async (req, res)=>{
            const cursor = serviceCollection.find({}).limit(3)
            const service = await cursor.toArray()
            res.send(service)
        })
        app.get("/allservice",async (req, res)=>{
            const cursor = serviceCollection.find({})
            const service = await cursor.toArray()
            res.send(service)
        })
        app.get("/servicedetails/:id",async (req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        // post request
        app.post("/addservice",async(req, res)=>{
            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })
        app.post("/addReview",async(req, res)=>{
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })
    }
    finally{

    }
}
runMongo().catch(err =>console.error(err))

app.get('/',(req,res)=>{
    res.send("Hello World!");
})

app.listen(5000, ()=>{
    console.log('listening on port 5000')
})
