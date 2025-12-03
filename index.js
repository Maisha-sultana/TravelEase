const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); 
const app = express();
const port = process.env.PORT || 3000;

app.use (cors());
app.use(express.json())

// 4qhi28Z1oT8cwUzR
// TravelEaseDB
const uri = "mongodb+srv://TravelEaseDB:4qhi28Z1oT8cwUzR@cluster0.mjn1osb.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) =>{
   res.send('travel is running')
})
      

async function run() {
  try {
    
    await client.connect();
   
    const db = client.db('travel_db');
    const productsCollection = db.collection('products');
    const bookingsCollection = db.collection('bookings'); 

      app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })

        app.get('/latest-vehicles', async (req, res) => {
            try {
              
                const cursor = productsCollection
                    .find({})
                    .sort({ _id: -1 }) // Sort by _id (which includes creation time) descending
                    .limit(6);         // Limit to the last 6 documents
                
                const result = await cursor.toArray();
                res.send(result); 
            } catch (error) {
                console.error('Error fetching latest products:', error);
                res.status(500).send({ message: 'Failed to fetch latest products' });
            }
        })
        
  
        app.get('/products/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }; 
                const product = await productsCollection.findOne(query);
                
                if (product) {
                    res.send(product);
                } else {
                    res.status(404).send({ message: 'Vehicle not found' });
                }
            } catch (error) {
                console.error('Error fetching single product:', error);
                res.status(500).send({ message: 'Invalid vehicle ID format or server error' });
            }
        });
    

        app.get('/products', async (req, res) => {
            try {
            
                const cursor = productsCollection.find({});
                const result = await cursor.toArray();
                res.send(result); 
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send({ message: 'Failed to fetch products' });
            }
        })
        
       
        app.post('/bookings', async (req, res) => {
            const newBooking = req.body;
            try {
                const result = await bookingsCollection.insertOne(newBooking);
                res.send(result);
            } catch (error) {
                console.error('Error posting booking:', error);
                res.status(500).send({ message: 'Failed to save booking request' });
            }
        });
   


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
 
  }
}
run().catch(console.dir);

app.listen(port, ()=>{
    console.log(`travel server is running on ${port}`)
})