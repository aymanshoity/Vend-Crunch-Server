const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
// middleware
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}
app.use(cors(corsConfig))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je93mhd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const productsCollection = client.db("Vend-Crunch").collection("products");
    const userCollection = client.db("Vend-Crunch").collection("users");
    const cartItemCollection = client.db("Vend-Crunch").collection("cart");




    // users related api

    app.post('/users', async (req, res) => {
      const user = req.body
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })
    app.get('/users', async (req, res) => {

      const result = await userCollection.find().toArray()
      res.send(result)
    })
    // products related api
    app.get('/products', async (req, res) => {
      const allProducts = await productsCollection.find().toArray()
      res.send(allProducts)
    })
    app.get('/products/allProducts', async (req, res) => {
      const allProducts = await productsCollection.find().toArray()
      res.send(allProducts)
    })
    

    app.get('/products/:category', async (req, res) => {
      const category = req.params.category;
      const query = { category: category }
      const products = await productsCollection.find(query).toArray()
      res.send(products)
    })
    app.get('/products/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.findOne(query)
      res.send(result)
    })

    // cart related api
    app.post('/cart',async(req,res)=>{
      const cartItem=req.body;
      const query = { product_id: cartItem.product_id,userEmail:cartItem.userEmail }
      const existingItem = await cartItemCollection.findOne(query)
      if (existingItem) {
        return res.send({ message: 'Item already added', insertedId: null })
      }
      const result=await cartItemCollection.insertOne(cartItem)
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
  res.send('Vend Crunch is opening Soon')
})

app.listen(port, () => {
  console.log(`Vend Crunch is running on port  ${port}`)
})