const { Schema, model } = require("mongoose");

const EquiposSchema = new Schema({
    id: String,
    equipo: String,
    imagen: String
});


module.exports = model('Equipos', EquiposSchema);
