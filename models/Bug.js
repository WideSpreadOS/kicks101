const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
    page_url: String,
    action_attempted: String,
    description: String,
    fixed: Boolean
});


module.exports = new mongoose.model('Bug', bugSchema);