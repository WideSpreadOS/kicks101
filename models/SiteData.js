const mongoose = require('mongoose');

const siteDataSchema = new mongoose.Schema({
    contact: {
        site: [
            {
                contact_type: String,
                contact_data: String
            }
        ],
        social: [
            {
                platform: String,
                platform_data: String
            }
        ],
    }
});


module.exports = new mongoose.model('SiteData', siteDataSchema);