const { requireAdmin, requireSelfOrAdmin } = require('../middleware/access.middleware');

function createRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
}

describe('Access middleware', () => {
    it('requireAdmin allows admin users', () => {
        const req = { isAdmin: true };
        const res = createRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledWith();
    });

    it('requireAdmin blocks non-admin users', () => {
        const req = { isAdmin: false };
        const res = createRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toMatchObject({ message: 'Forbidden', status: 403 });
    });

    it('requireSelfOrAdmin allows owner', () => {
        const req = { isAdmin: false, isSelf: true };
        const res = createRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);

        expect(next).toHaveBeenCalledWith();
    });

    it('requireSelfOrAdmin allows admin', () => {
        const req = { isAdmin: true, isSelf: false };
        const res = createRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);

        expect(next).toHaveBeenCalledWith();
    });

    it('requireSelfOrAdmin blocks non owner non admin', () => {
        const req = { isAdmin: false, isSelf: false };
        const res = createRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toMatchObject({ message: 'Forbidden', status: 403 });
    });
});
