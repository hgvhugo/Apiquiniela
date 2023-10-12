const { Schema, model } = require("mongoose");

const SemanasSchema = new Schema({
    semanaactiva: String,
    activa: Boolean
});


module.exports = model('Semanas', SemanasSchema);