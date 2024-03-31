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
    const feedbackCollection = client.db("Vend-Crunch").collection("feedbacks");




    // users related api

    app.post('/users', async (req, res) => {
      const user = req.body
      const queryEmail = { email: user.userEmail }
      const queryID = { userID: user.userID }
      const existingUserEmail = await userCollection.findOne(queryEmail)
      const existingUserID = await userCollection.findOne(queryID)
      if (existingUserEmail) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      if (existingUserID) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })
    app.get('/users', async (req, res) => {

      const result = await userCollection.find().toArray()
      res.send(result)
    })
    app.get('/users/:email', async (req, res) => {
      const email=req.params.email;
      const query={userEmail:email}
      const result = await userCollection.findOne(query)
      res.send(result)
    })

    app.patch('/users/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const existingRole=req.body.role;
      const updatedRole={
        $set:{
          role:existingRole
        }
      }
      const result=await userCollection.updateOne(query,updatedRole)
      res.send(result)
    })

    app.delete('/users/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await userCollection.deleteOne(query)
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
    app.patch('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const existingProduct=req.body;
      const updatedProduct={
        $set:{
          productName:existingProduct.productName, 
          amount:existingProduct.amount, 
          quantity:existingProduct.quantity, 
          category:existingProduct.category, 
          price:existingProduct.price, 
          brandName:existingProduct.brandName, 
          imageURL:existingProduct.imageURL, 
        }
      }
      const result = await productsCollection.updateOne(query,updatedProduct)
      res.send(result)
    })

    app.post('/products',async(req,res)=>{
      const item=req.body;
      const cursor=await productsCollection.insertOne(item)
      res.send(cursor)
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

    app.get('/cart/:email',async(req,res)=>{
      const email=req.params.email;
      const query={userEmail:email}
      const result=await cartItemCollection.find(query).toArray()
      res.send(result)
    })

    app.delete('/cart/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await cartItemCollection.deleteOne(query)
      res.send(result)
    })

    // feedbacks related api

    app.post('/feedbacks',async(req,res)=>{
      const feedback=req.body;
      const cursor=await feedbackCollection.insertOne(feedback)
      res.send(cursor)
    })
    app.get('/feedbacks',async(req,res)=>{
      const cursor=await feedbackCollection.find().toArray()
      res.send(cursor)
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