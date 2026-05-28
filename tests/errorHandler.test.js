const errorHandler = require('../middleware/errorHandler');

function createRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
}

describe('Error handler', () => {
    it('uses provided status and message', () => {
        const req = {};
        const res = createRes();
        const next = jest.fn();
        const err = { status: 404, message: 'Not found' };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });

    it('falls back to 500 and default message', () => {
        const req = {};
        const res = createRes();
        const next = jest.fn();

        errorHandler({}, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
});
