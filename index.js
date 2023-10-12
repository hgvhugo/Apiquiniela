const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const UsuarioModel = require('./models/Usuarios');
const Partidos = require('./models/Partidos');
const Equipos = require('./models/Equipos');
const Semanas = require('./models/Semana');
const mongoose = require('mongoose');
var sanitize = require('mongo-sanitize');
const ObjectId = mongoose.Types.ObjectId;

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

app.use(cors({ credentials: true, origin: 'http://localhost:3010' }));
app.use(cors({ credentials: true, origin: 'http://ec2-18-220-50-97.us-east-2.compute.amazonaws.com:3000' }));


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

mongoose.connect('mongodb+srv://hugocrs:Leo21717---@cluster0.adq5onv.mongodb.net/Quinielas?retryWrites=true&w=majority');


/* EQUIPOS */

app.get('/api/quinielas/equipos', async (req, res) => {

    await client.connect();
    const collection = client.db('Quinielas').collection('equipos');

    // Find all documents in the collection
    const cursor = collection.find();
    const results = await cursor.toArray();

    // Print the results
    res.send(results);

});

app.post('/api/quinielas/equipos', async (req, res) => {

    const equipos = new Equipos();
    equipos.id = req.body.id;
    equipos.equipo = req.body.equipo;
    equipos.imagen = req.body.imagen;

    equipos.save()
        .then((equipo) => {

            return res.status(200).send({ message: "Equipo " + equipo.equipo + " registrado con éxito!" });

        }).catch((err) => {
            return res.status(500).send({ message: err });
        });

});

/*PARTIDOS */


app.get('/api/quinielas/partidos/:id', async (req, res) => {

    var semana = req.params.id
    Partidos.find({ semana: semana })
        .catch((err) => {
            return res.status(400).send({ message: "Error" });

        })
        .then(function (partidos) {
            // Return if user not found in database
            return res.status(200).send({ partidos });

        });

});


app.post('/api/quinielas/partidos', async (req, res) => {

    const Partido = new Partidos();
    Partido.semana = req.body.semana;
    Partido.imglocal = req.body.imglocal;
    Partido.local = req.body.local;
    Partido.rlocal = req.body.rlocal;
    Partido.imgvisitante = req.body.imgvisitante;
    Partido.visitante = req.body.visitante;
    Partido.rvisitante = req.body.rvisitante;

    Partido.save()
        .then((Partido) => {

            return res.status(200).send({ message: "Partido " + Partido.id + " registrado con éxito!" });

        }).catch((err) => {
            return res.status(500).send({ message: err });
        });
});


app.get('/api/quinielas/partidosSA', async (req, res) => {

    await client.connect();
    const collection = client.db('Quinielas').collection('semanas');

    // Find all documents in the collection
    const cursor = collection.find();
    const results = await cursor.toArray();

    // Print the results
    res.send(results);

});



app.post('/api/quinielas/partidosSA', async (req, res) => {

    /*const Semana = new Semanas();

    Semana.semanaactiva = req.body.semanaactiva;
    Semana.activa = req.body.activa;

    Semana.save()
        .then((Partido) => {

            return res.status(200).send({ message: "Semana " + Semana.semana + " registrado con éxito!" });

        }).catch((err) => {
            return res.status(500).send({ message: err });
        });*/


    Semanas.findOneAndUpdate({ _id: req.body._id }, { activa: req.body.activa })
        .then(function (semana) {
            if (semana) {
                // send mensaje de que todo bien
                return res.status(200).send({ "message": "Semana actualizada correctamente" });
            } else {
                //no user was found 
                return res.status(401).send({ "message": "Semana no encontrada." });
            }
        })
        .catch((err) => {
            //throw err;
            return res.status(500).send({ "message": "Error. " + err.message });
        });
});
/* USUARIOS */

app.post('/api/quinielas/usuarios', async (req, res) => {

    const User = new UsuarioModel();
    User.Username = req.body.Username;
    User.Nombre = req.body.Nombre;
    User.Apellido = req.body.Apellido;
    let passSanitized = sanitize(req.body.Password.toString());

    User.setPassword(passSanitized);

    User.save()
        .then((User) => {

            return res.status(200).send({ message: "Usuario " + User.Username + " registrado con éxito!" });

        }).catch((err) => {
            return res.status(500).send({ message: err });
        });
});



app.post('/api/quinielas/login', async (req, res) => {

    username = sanitize(req.body.username);
    password = sanitize(req.body.password);

    UsuarioModel.findOne({ Username: username })
        .catch((err) => {
            return res.status(400).send({ message: "Error" });

        })
        .then(function (user) {
            // Return if user not found in database

            if (!user) {
                return res.status(401).send({ message: "Usuario no encontrado" });
            }

            // Return if password is wrong
            if (!user.validPassword(password)) {
                return res.status(401).send({ message: "Contraseña incorrecta" });
            }
            let rol;
            if (user.Username == "Hugo" || user.Username == "Itzel") {
                rol = "Admin";
            }
            else {
                rol = "User";
            }
            // If credentials are correct, return the user object
            return res.status(200).send({ user, rol: rol, token: 'ABC123', refreshToken: 'ABC123' });

        });

});




app.listen(3001, () => {
    console.log('Server running on port 3001');
});


