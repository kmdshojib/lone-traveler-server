const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors())
app.use(express.json());

const uri = "mongodb+srv://adminDb:0IaI3euMbDOX2NV1@cluster0.ygyoxnw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const runMongo = async () =>{
    try{
        const serviceCollection =  client.db("reviewdb").collection("service")

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