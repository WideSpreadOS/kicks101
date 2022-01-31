const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    feature_name: String,
    description: String,
    done: Boolean
});


module.exports = new mongoose.model('Feature', featureSchema);