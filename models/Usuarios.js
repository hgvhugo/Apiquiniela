const { Schema, model } = require("mongoose");
const crypto = require('crypto');

const UsuarioSchema = new Schema({
    Username: String,
    Nombre: String,
    Apellido: String,
    hash: String,
    salt: String,
});

UsuarioSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
};

UsuarioSchema.methods.validPassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
    return this.hash === hash;
};


module.exports = model('Usuarios', UsuarioSchema);
