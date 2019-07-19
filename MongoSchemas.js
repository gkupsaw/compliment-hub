require('colors');
const mongoose = require('mongoose');

const complimentSchema = new mongoose.Schema({
        name: String,
        compliment: String,
        id: String,
        timestamp: Object,
        favorited: Boolean
    });
const Compliment = mongoose.model('Compliment', complimentSchema);

const imageSchema = new mongoose.Schema({
        name: String,
        id: String,
        timestamp: Object,
        data: Object
    });
const Image = mongoose.model('Image', imageSchema);

const generateRandIdentifier = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';
    for (let i = 0; i < 6; i++)
        result += chars[(Math.floor(Math.random() * chars.length))];

    return result;
}

module.exports = {

    complimentSchema,

    Compliment,

    Image,

    generateRandIdentifier,

    createCompliment: async (name, compliment) => {
        const newCompliment = new Compliment ({
            name,
            compliment,
            id: generateRandIdentifier(),
            timestamp: new Date(),
            favorited: false
        });
        await newCompliment.save(err => {
            if (err) return console.error('Error creating compliment:'.red, err);
            console.log("Created a new compliment!".green);
        });
        return newCompliment;
    },

    uploadImages: async files => {
        if (files.constructor !== Array) files = [files];
        images = files.reduce((acc, file) => 
            acc.concat(new Image({
                name: file.originalname,
                id: generateRandIdentifier(),
                timestamp: new Date(),
                data: file
            })),
        []);
        await Image.collection.insertMany(images, err => {
            if (err) return console.error('Error saving doc(s) to DB:'.red, err);
            console.log("Saved image(s)!".green);
        });
        return images;
    },

    deleteCompliments: async () => {
        await Compliment.deleteMany({}).catch(err => console.error('Error deleting compliments:', err));
        console.log('Deleted all compliments!'.yellow);
    },

    deleteImages: async () => {
        await Image.deleteMany({}).catch(err => console.error('Error deleting images:', err));
        console.log('Deleted all images!'.yellow);
    }
}