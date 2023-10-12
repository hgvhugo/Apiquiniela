const { Schema, model } = require("mongoose");
const crypto = require('crypto');

const PartidosSchema = new Schema({
    semana: String,
    imglocal: String,
    local: String,
    rlocal: Boolean,
    imgvisitante: String,
    visitante: String,
    rvisitante: Boolean,
    activa: Boolean
});


module.exports = model('Partidos', PartidosSchema);
