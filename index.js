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
    console.log("MongoDB client connected."); // Log successful connection
   
    const db = client.db('travel_db');
    const productsCollection = db.collection('products');
    const bookingsCollection = db.collection('bookings'); 

      app.post('/products', async (req, res) => {
            const newProduct = req.body;
            try {
                const result = await productsCollection.insertOne(newProduct);
                
                // --- CRITICAL DEBUGGING LOG ---
                if (result && result.insertedId) {
                    console.log(`✅ SUCCESSFULLY INSERTED: ID ${result.insertedId}. Check MongoDB dashboard now.`);
                    res.send(result);
                } else {
                    // Insert operation did not return expected insertedId field
                    console.error('❌ MONGODB RESPONSE ERROR: Insert operation returned without insertedId.');
                    res.status(500).send({ message: 'Insert operation failed internally.' });
                }
                // ------------------------------
                
            } catch (error) {
                // সার্ভার কনসোলে ত্রুটি লগ করুন
                console.error('❌ FATAL MONGODB INSERT FAILURE for /products:', error.message);
                // ফ্রন্টএন্ডে এরর মেসেজ পাঠান
                res.status(500).send({ message: 'Failed to insert document into MongoDB.', error: error.message });
            }
        })

        app.get('/latest-vehicles', async (req, res) => {
            try {
              
                const cursor = productsCollection
                    .find({})
                    .sort({ _id: -1 }) 
                    .limit(6);         
                
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