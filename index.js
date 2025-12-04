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

app.get('/', (req, res) => {
   res.send('travel is running')
})
      

async function run() {
  try {
    
    await client.connect();
    console.log("MongoDB client connected."); 
   
    const db = client.db('travel_db');
    const productsCollection = db.collection('products');
    const bookingsCollection = db.collection('bookings'); 

      // POST /products: New Vehicle Addition
      app.post('/products', async (req, res) => {
            const newProduct = req.body;
            try {
                const result = await productsCollection.insertOne(newProduct);
                
                if (result && result.insertedId) {
                    console.log(`✅ SUCCESSFULLY INSERTED: ID ${result.insertedId}. Check MongoDB dashboard now.`);
                    res.send(result);
                } else {
                    console.error('❌ MONGODB RESPONSE ERROR: Insert operation returned without insertedId.');
                    res.status(500).send({ message: 'Insert operation failed internally.' });
                }
                
            } catch (error) {
                
                console.error('❌ FATAL MONGODB INSERT FAILURE for /products:', error.message);
                res.status(500).send({ message: 'Failed to insert document into MongoDB.', error: error.message });
            }
        })

        // GET /latest-vehicles
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
        
  
        // GET /products/:id
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
    

        // GET /products
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

        // GET /my-products/:email (My Vehicles)
       app.get('/my-products/:email', async (req, res) => {
            try {
                // --- CRITICAL FIX ---
                const email = req.params.email;
                const query = { userEmail: email }; // <-- এই দুটি লাইন অপরিহার্য
                // --------------------
                
                const cursor = productsCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching products by owner email:', error);
                res.status(500).send({ message: 'Failed to fetch owner products' });
            }
        });

        // ✅ GET /my-bookings/:email (My Bookings Route - FIXED)
        app.get('/my-bookings/:email', async (req, res) => {
            try {
                // --- CRITICAL FIX ---
                const email = req.params.email;
                const query = { renterEmail: email }; // <-- এই দুটি লাইন অপরিহার্য
                // --------------------
                const cursor = bookingsCollection.find(query).sort({ bookingDate: -1 });
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching bookings by renter email:', error);
                res.status(500).send({ message: 'Failed to fetch user bookings' });
            }
        });
        
        // DELETE /products/:id
        app.delete('/products/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await productsCollection.deleteOne(query);

                if (result.deletedCount === 1) {
                    console.log(`✅ SUCCESSFULLY DELETED: ID ${id}`);
                    res.send({ acknowledged: true, deletedCount: 1 });
                } else {
                    res.status(404).send({ message: 'Vehicle not found or already deleted' });
                }
            } catch (error) {
                console.error('Error deleting vehicle:', error);
                if (error.name === 'BSONTypeError') {
                     res.status(400).send({ message: 'Invalid vehicle ID format' });
                } else {
                     res.status(500).send({ message: 'Failed to delete vehicle' });
                }
            }
        });

        // PUT /products/:id
        app.put('/products/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedProduct = req.body;
                // Remove _id from the body to prevent mutation error
                delete updatedProduct._id; 

                const filter = { _id: new ObjectId(id) };
                // Use $set to update fields
                const updateDoc = { $set: updatedProduct };

                const result = await productsCollection.updateOne(filter, updateDoc, { upsert: false });

                if (result.matchedCount === 0) {
                    res.status(404).send({ message: 'Vehicle not found' });
                } else {
                    res.send({ acknowledged: true, modifiedCount: result.modifiedCount });
                }
            } catch (error) {
                console.error('Error updating vehicle:', error);
                if (error.name === 'BSONTypeError') {
                    res.status(400).send({ message: 'Invalid vehicle ID format' });
                } else {
                    res.status(500).send({ message: 'Failed to update vehicle' });
                }
            }
        });
        
       
        // POST /bookings
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