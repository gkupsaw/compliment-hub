const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MongoSchemas = require('./MongoSchemas.js');
const Compliment = MongoSchemas.Compliment;
const Image = MongoSchemas.Image;
const port = process.env.PORT;

if (dotenv.error) console.log('DOTENV error:', dotenv.error);

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const db = mongoose.connection;

db.once('open', () => {    // bind a function to perform when the database has been opened
  console.log("Connected to DB!");
});
process.on('SIGINT', () => {   //CTR-C to close
   mongoose.connection.close(() => {
       console.log('DB connection closed by Node process ending');
       process.exit(0);
   });
});
const url = process.env.MONGO_HOST;

mongoose.connect(url, {useNewUrlParser: true, w:1});

db.on('error', console.error);

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const socket_name = 'Universal';

io.sockets.on('connection', (socket) => {
    socket.on('join', () => {
        console.log('- Socket Connected! Socket ID:', socket.id);
        socket.join(socket_name);
    });

    socket.on('complimentFavorited', compliment => {
        Compliment.updateOne({ id: compliment.id }, { $set: { favorited: !compliment.favorited } }, err => {
            if (err) console.log(err);
            console.log('Compliment favorited');
            Compliment.find({}, (err,data) => {
                if (err) return console.error(err);
                io.sockets.in(socket_name).emit('complimentsUpdated', data);
            });
        });
    });
    
    socket.on('error', () => {});
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

//File Uploading
//https://medium.com/@fabianopb/upload-files-with-node-and-react-to-aws-s3-in-3-steps-fdaa8581f2bd
//https://expressjs.com/en/starter/static-files.html
//https://codeburst.io/image-uploading-using-react-and-node-to-get-the-images-up-c46ec11a7129
//https://medium.com/@mahesh_joshi/reactjs-nodejs-upload-image-how-to-upload-image-using-reactjs-and-nodejs-multer-918dc66d304c
//https://medium.com/@paulrohan/file-upload-to-aws-s3-bucket-in-a-node-react-mongo-app-and-using-multer-72884322aada

//Image Serving
//https://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs

//Cheat Sheets
//https://kapeli.com/dash

//NPM
//https://www.npmjs.com/package/multer-s3

//S3
//https://www.zeolearn.com/magazine/uploading-files-to-aws-s3-using-nodejs
//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

//HTTP Codes:
//200: OK
//201: CREATED
//202: ACCEPTED (incomplete process)
//204: NO CONTENT (sending nothing back)
//400: BAD REQUEST
//403: FORBIDDEN


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const colors = require('colors');
const cors = require('cors');
const multer = require('multer');
app.use(cors({origin: true}));
app.use('/uploads', express.static('../uploads/'));

app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
app.use(bodyParser.json({limit: '50mb', extended: true}));

app.use((req, res, next) => {  //copied from enable-cors.org, handles CORS related errors
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const genFilename = file => {
    let date = new Date();
    date = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear() + '--' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + '-' + date.getMilliseconds();
    return 'IMG-' + date + '-' + file.originalname;
}

/* Multer */

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => callback(null, '../uploads/'),
//     filename: (req, file, callback) => callback(null, genFilename(file)),
//     fileFilter: (req, file, cb) => (file.mimetype === 'img/jpeg' || file.mimetype === 'img/png') ? cb(null, true) : cb(null, false)
// });

// upload = multer({storage}).array('image');  // single instead of array for one file

// app.post('/upload', (req, res) => {
//     console.log('- Image upload request received:', req.method.cyan, req.url.underline);
//     upload(req, res, async err => {
//         if (err) console.log('Error uploading'.red, err);
//         let db_files = await MongoSchemas.uploadImages(images);
//         console.log('Uploaded and saved file(s) in DB'.green);
//         res.status(200).send(db_files);
//     });
// });

/* Multer S3 */

const multers3 = require('multer-s3');
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
}); 

const s3 = new AWS.S3();
const upload = multer({
    storage: multers3({
        s3,
        bucket: process.env.BUCKET,
        key: (req, file, cb) => cb(null, genFilename(file))
    })
});

app.use((err, req, res, next) => {
    console.error('This is the invalid field ->', err.field)
    next(err)
});

app.post('/upload', upload.array('image'), async (req, res) => {
    console.log('- Image upload request received:', req.method.cyan, req.url.underline);
    let images = req.file ? req.file : req.files;
    let db_files = await MongoSchemas.uploadImages(images);
    console.log('Uploaded and saved file(s) in DB'.green);
    res.status(200).send(db_files);
});

app.post('/remove/image', (req, res) => {
    console.log('- Image deletion request received:', req.method.cyan, req.url.underline);
    const { file } = req.body;
    Image.deleteOne({ _id: file._id })
        .then(() => {
            console.log('Successfully removed image from DB'.green);
            console.log('Removing from S3...'.cyan);
            s3.deleteObject({ Bucket: process.env.BUCKET, Key: 'uploads/' + file.key },
                err => {
                        if (err) console.error('Error removing from S3'.red, err);
                        else console.log('Successfully removed image from S3 bucket'.green);
                        res.status(200).send({ success: true });
                    }
                );
        })
        .catch(err => console.error('Error removing from DB'.red, err));
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.post('/compliment', (req, res) => {
    console.log('- Compliment submission request received:', req.method.cyan, req.url.underline);
    const { compliment, name } = req.body;
    MongoSchemas.createCompliment(name, compliment)
        .then(compliments => {
            io.sockets.in(socket_name).emit('complimentsUpdated', compliments);
            res.status(200).end();
        });
});

app.get('/compliments', (req, res) => {
    console.log('- Compliment data request received:', req.method.cyan, req.url.underline);
    Compliment.find({}, (err,data) => {
        if (err) return console.error('Error getting compliments:'.red, err);
        res.status(200).send(data);
    });
});

app.get('/pictures', (req, res) => {
    console.log('- Images request received:', req.method.cyan, req.url.underline);
    Image.find({}, (err, data) => {
        if (err) return console.error('Error getting pictures'.red, err);
        res.status(200).send(data);
    });
});

app.delete('/delete/compliments', (req, res) =>  {
    console.log('- Total compliments deletion request received:', req.method.cyan, req.url.underline);
    MongoSchemas.deleteCompliments();
    res.status(204).end();
});

app.delete('/delete/imgs', (req, res) =>  {
    console.log('- Total images deletion request received:', req.method.cyan, req.url.underline);
    MongoSchemas.deleteImages();
    res.status(204).end();
});

app.delete('/delete/all', (req, res) =>  {
    console.log('- Total deletion request received:', req.method.cyan, req.url.underline);
    MongoSchemas.deleteCompliments();
    MongoSchemas.deleteImages();
    res.status(204).end();
});

app.get('*', (req, res) => {   //error
    console.log('- Bad request received:', req.method.cyan, req.url.underline);
    console.log('Error, invalid routing');
    res.status(404).send('<h1>Error 404: Page Does Not Exist</h1>');
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

server.listen(port, () => {
    console.log('Server listening on', port.toString().yellow)
});