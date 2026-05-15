const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDb() {
    await mongoose.connect(process.env.DATABASE_KEY);
}

mongoose.connection.on('error', err => {
    console.log(err);
});

connectToDb()
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(console.log);

module.exports = {
    connectToDb,
};
