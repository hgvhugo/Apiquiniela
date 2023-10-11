const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());
app.disable('x-powered-by');

app.use(
    cors({
        origin: true,
        methods: "GET,HEAD,PUT,POST,DELETE",
        credentials: true,
    })
);

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 700, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // store: ... , // Use an external store for more precise rate limiting
    message: 'Too many requests' // message to send  
})

// Apply the rate limiting middleware to all requests
app.use(limiter);


// Replace the following with your Atlas connection string
const uri = 'mongodb+srv://hugocrs:Leo21717---@cluster0.adq5onv.mongodb.net/Quinielas?retryWrites=true&w=majority';

const client = new MongoClient(uri);

async function run() {
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        console.log('Connected to MongoDB Atlas');

        const collection = client.db('Quinielas').collection('Equipos');

        // Find all documents in the collection
        const cursor = collection.find();
        const results = await cursor.toArray();

        // Print the results
        console.log(results);

    } finally {
        // Close the connection when we're done
        await client.close();
    }
}

app.get('/api/quinielas/equipos', async (req, res) => {

    await client.connect();
    const collection = client.db('Quinielas').collection('Equipos');

    // Find all documents in the collection
    const cursor = collection.find();
    const results = await cursor.toArray();

    // Print the results
    res.send(results);

});

app.post('/api/quinielas/equipos', async (req, res) => {

    let numb = 0;
    await client.connect();

    const count = await client.db('Quinielas').collection('Equipos').countDocuments();
    numb = count;
    client.db('Quinielas').collection('Equipos').insertOne({
        id: req.body.index,
        Equipo: req.body.equipo
    });

    // Print the results
    res.json({ status: 'ok', num: numb, equipo: req.body.equipo });

});





app.listen(3001, () => {
    console.log('Server running on port 3001');
});


