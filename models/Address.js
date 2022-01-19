const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    address_owner: String,
    building_number: {
        type: String,
        required: true
    },
    street: String,
    unit_number: String,
    apartment_number: String,
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    special_instructions: [String]
});

const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;