const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mznotex.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();

    const carCollection = client.db('autoSport').collection('cars');

    app.get('/all/:limit', async (req, res) => {
        const count = req.params.limit
        // console.log(parseInt(count))
        const cursor = carCollection.find().limit(parseInt(count))
        const result = await cursor.toArray()
        res.send(result)
    })

    // car by category
    app.get('/allcars/:category', async (req, res) => {
        // console.log(req.params.category)
        const result = await carCollection.find({category: {$regex: req.params.category, $options: 'i'}}).toArray()
        res.send(result)
    })

    // my cars
    app.get('/mycars/', async (req, res) => {

        const sort = req.query.sort;
        const query = {email: req.query.email}
        
        if(sort === ''){ 
            const result = await carCollection.find(query).toArray()
            res.send(result)
        }
        else if(sort === 'Ascending'){
            const result = await carCollection.find(query).sort({price: 1}).toArray()
            res.send(result)
        }else if(sort === 'Descending'){
            const result = await carCollection.find(query).sort({price: -1}).toArray()
            res.send(result)
        }
    })
    // get car by id 
    app.get('/car/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id)}
        const result = await carCollection.findOne(query)
        res.send(result)
    })

    app.post('/addcar', async (req, res) => {
        const newCar = req.body
        const result = await carCollection.insertOne(newCar)
        res.send(result)
    })

    app.patch('/updatecar/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id)}
        const updatedCar = req.body
        const updatedDoc = {
            $set: {
                price: updatedCar.price,
                quantity: updatedCar.quantity,
                details: updatedCar.details,
            }
        }
        const result = await carCollection.updateOne(filter, updatedDoc)
        res.send(result)
                
    })

    app.delete('/deletecar/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id)}
        const result = await carCollection.deleteOne(query)
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('AutoSport SERVER IS RUNNING...')
})

app.listen(port, () => {
    console.log(`AutoSport running on http://localhost:${port}`)
})