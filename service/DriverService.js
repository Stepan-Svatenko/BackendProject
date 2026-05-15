const Driver = require('../models/Driver');

async function createDriver(data) {
    const res = await Driver.create(data);

    return res;
}

async function getDrivers() {
    const drivers = await Driver.find();
    return drivers;
}
async function removeDriver(id) {
    const driver = await Driver.findByIdAndDelete(id);
    console.log('there', driver);
    return driver;
}

module.exports = {
    createDriver,
    getDrivers,
    removeDriver,
};
