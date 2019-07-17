require('colors');
const mongoose = require('mongoose');

const complimentSchema = new mongoose.Schema({
        name: String,
        compliment: String,
        id: String,
        time_stamp: Object,
        favorited: Boolean
    });
const Compliment = mongoose.model('Compliment', complimentSchema);

const imageSchema = new mongoose.Schema({
        name: String,
        id: String,
        time_stamp: Object,
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

    CreateCompliment: async (name, compliment) => {
        const new_compliment = new Compliment ({
            name,
            compliment,
            id: generateRandIdentifier(),
            time_stamp: new Date(),
            favorited: false
        });
        await new_compliment.save(err => {
            if (err) return console.error('Error creating compliment:'.red, err);
            console.log("Created a new compliment!".green);
        });
        return data;
    },

    UploadImage: async file => {
        const new_img = new Image({
            name: file.originalname,
            id: generateRandIdentifier(),
            time_stamp: new Date(),
            data: file
        });
        await new_img.save(err => {
            if (err) return console.error('Error saving doc to DB:'.red, err);
            console.log("Saved image!".green);
        });
        return data;
    },

    DeleteCompliments: async () => {
        await Compliment.deleteMany({}).catch(err => console.error('Error deleting compliments:', err));
        console.log('Deleted all compliments!'.yellow);
    },

    DeleteImages: async () => {
        await Image.deleteMany({}).catch(err => console.error('Error deleting images:', err));
        console.log('Deleted all images!'.yellow);
    }
}