const driverService = require('../service/DriverService');

const getUsers = async (req, res) => {
    const drivers = await driverService.getDrivers();
    res.json(drivers);
};

const addUser = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send('Empty body');
        }

        const driver = await driverService.createDriver(req.body);
        return res.status(201).json(driver);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
async function remove(req, res) {
    try {
        const { id } = req.params;
        console.log(id, req.params);

        const deleted = await driverService.removeDriver(id);

        if (!deleted) {
            return res.status(404).send('Not found');
        }

        return res.send('Deleted');
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

module.exports = {
    getUsers,
    addUser,
    remove,
};
