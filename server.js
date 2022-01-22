const express = require('express');
const app = express();
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const methodOverride = require('method-override');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const path = require('path');

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to MongoDB
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Multer
let gfs;

//Init gfs
const conn = mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true })
conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

//Create storage object
const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = req.user.lname + '-' + req.user.fname + '_' + req.user._id + '_' + buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

// Favicon
app.use(favicon(path.join(__dirname, 'public', 'kicks101_logo_1a1a1a.ico')))

// Middleware
app.use(bodyParser.json());

// Static
app.use(express.static('public'));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Method Override
// Connect Flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes

app.use('/', require('./routes/index'));
app.use('/test', require('./routes/test'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/products', require('./routes/products'));
app.use('/products/sneakers', require('./routes/sneakers'));





/* SITE MANAGMENT */

app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if Files
        if (!files || files.lenth === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files do exist
        console.log(files)
        return res.render('all-images', { files })
    })
})

app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if Files
        if (!file || file.lenth === 0) {
            return res.status(404).json({
                err: 'That file does not exist'
            });
        }

        // Files do exist
        return res.render('single-image-file', { file })
    })
})

app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if Files
        if (!file || file.lenth === 0) {
            return res.status(404).json({
                err: 'That file does not exist'
            });
        }

        // Files do exist
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read the output to the stream
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            })
        }
    })
});


app.delete('/delete-image/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    console.log(`File ID being deleted: ${fileId}`);
    gfs.remove({ _id: fileId, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        } else {
            res.redirect('/files')
        }
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on ${PORT}`))