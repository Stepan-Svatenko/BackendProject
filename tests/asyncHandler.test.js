const asyncHandler = require('../utils/asyncHandler');

function createRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
}

describe('asyncHandler', () => {
    it('passes errors to next when next exists', async () => {
        const handler = asyncHandler(async () => {
            throw new Error('boom');
        });
        const req = {};
        const res = createRes();
        const next = jest.fn();

        await handler(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('boom');
    });

    it('writes response when next is missing', async () => {
        const handler = asyncHandler(async () => {
            const error = new Error('bad');
            error.status = 422;
            throw error;
        });
        const req = {};
        const res = createRes();

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.send).toHaveBeenCalledWith('bad');
    });

    it('rethrows when res cannot handle the error', async () => {
        const handler = asyncHandler(async () => {
            throw new Error('fatal');
        });
        const req = {};
        const res = {};

        await expect(handler(req, res)).rejects.toThrow('fatal');
    });
});
