jest.mock('../service/BookingService', () => ({
    getBookings: jest.fn(),
    getBookingById: jest.fn(),
    createBooking: jest.fn(),
    updateBooking: jest.fn(),
    removeBooking: jest.fn(),
}));

const bookingService = require('../service/BookingService');
const bookingsController = require('../controllers/bookings.controller');

function createRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
}

describe('Bookings controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('listBookings returns bookings', async () => {
        bookingService.getBookings.mockResolvedValue([{ bookingId: 'BK-1' }]);

        const req = {};
        const res = createRes();

        await bookingsController.listBookings(req, res);

        expect(res.json).toHaveBeenCalledWith([{ bookingId: 'BK-1' }]);
    });

    it('getBooking returns booking when found', async () => {
        bookingService.getBookingById.mockResolvedValue({ _id: '1', bookingId: 'BK-1' });

        const req = { params: { id: '1' } };
        const res = createRes();

        await bookingsController.getBooking(req, res);

        expect(res.json).toHaveBeenCalledWith({ _id: '1', bookingId: 'BK-1' });
    });

    it('getBooking returns 404 when missing', async () => {
        bookingService.getBookingById.mockResolvedValue(null);

        const req = { params: { id: '1' } };
        const res = createRes();

        await bookingsController.getBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });

    it('createBooking returns 400 for empty body', async () => {
        const req = { body: {} };
        const res = createRes();

        await bookingsController.createBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Empty body');
    });

    it('createBooking returns created booking', async () => {
        bookingService.createBooking.mockResolvedValue({ _id: '1', bookingId: 'BK-1' });

        const req = { body: { bookingId: 'BK-1' } };
        const res = createRes();

        await bookingsController.createBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ _id: '1', bookingId: 'BK-1' });
    });

    it('createBooking returns 400 when service throws', async () => {
        bookingService.createBooking.mockImplementation(() => {
            throw new Error('create error');
        });

        const req = { body: { bookingId: 'BK-1' } };
        const res = createRes();

        await bookingsController.createBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('create error');
    });

    it('updateBooking returns updated booking', async () => {
        bookingService.updateBooking.mockResolvedValue({ bookingId: 'BK-1' });

        const req = { params: { id: '1' }, body: { bookingStatus: 'confirmed' } };
        const res = createRes();

        await bookingsController.updateBooking(req, res);

        expect(res.json).toHaveBeenCalledWith({ bookingId: 'BK-1' });
    });

    it('updateBooking returns 400 when service throws', async () => {
        bookingService.updateBooking.mockImplementation(() => {
            throw new Error('update error');
        });

        const req = { params: { id: '1' }, body: { bookingStatus: 'confirmed' } };
        const res = createRes();

        await bookingsController.updateBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('update error');
    });

    it('updateBooking returns 404 when booking is missing', async () => {
        bookingService.updateBooking.mockResolvedValue(null);

        const req = { params: { id: '1' }, body: { bookingStatus: 'confirmed' } };
        const res = createRes();

        await bookingsController.updateBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });

    it('removeBooking returns Deleted', async () => {
        bookingService.removeBooking.mockResolvedValue({ _id: '1' });

        const req = { params: { id: '1' } };
        const res = createRes();

        await bookingsController.removeBooking(req, res);

        expect(res.send).toHaveBeenCalledWith('Deleted');
    });

    it('removeBooking returns 404 when missing', async () => {
        bookingService.removeBooking.mockResolvedValue(null);

        const req = { params: { id: '1' } };
        const res = createRes();

        await bookingsController.removeBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });
});
