const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken")

require('dotenv').config()

const app = express();
app.use(cors())
app.use(express.json());

// Mongo DB UrI and client

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ygyoxnw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Verify jwt
const  verifyJWT = (req,res,next) =>{
    const authHeader = req.headers.authorization
    if(!authHeader){
        res.send({Message: " Unauthorized access token!"})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (error,decoded)=>{
        error && res.status(401).send({Message: " Unauthorized access token!"}) 
        req.decoded = decoded
        next()
    })

}

// Mongo DB poerations 

const runMongo = async () =>{
    try{
        const serviceCollection =  client.db("reviewdb").collection("service")
        const reviewCollection =  client.db("reviewdb").collection("review")

        // Jwt operation

        app.post("/jwt",(req, res)=>{
            const user = req.body
            const token = jwt.sign(user,process.env.ACCESS_TOKEN,)
            res.send({token})
        })

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
        app.get("/reviews",verifyJWT, async (req,res)=>{
           const decoded = req.decoded
           console.log(decoded)
           if(decoded.email !== req.query.email){
                res.status(403).send({Message: " Unauthorized access token!"})
           }
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray();
            res.send(review)
        })
        app.get("/allreviews", async (req, res)=>{
            const cursor = reviewCollection.find({}).sort({_id: -1})
            const review = await cursor.toArray()
            console.log(review)
            res.send(review)
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

        // delete the review
        app.delete("/reviews/:id", async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)} 
            const result = await reviewCollection.deleteOne(query)
            console.log(result)
            res.send(result)
        })

        // updating the review section
        app.patch("/reviews/:id", async(req, res)=>{
            const id = req.params.id
            const review = req.params.status
            console.log(review)
            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };
        
            const query = {_id: ObjectId(id)} 
            const udatedReview = req.body
            const updateDocument = {
                $set:udatedReview
            }
            const result = await reviewCollection.updateOne(query, updateDocument,options)
            console.log(udatedReview,result)
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
