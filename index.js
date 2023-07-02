const express = require('express');
const app = express();
app.use(express.json());


let rooms = [];
let bookings = [];

// 1. Create a room
app.post('/rooms', (req, res) => {
  const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;
  const room = {
    id: rooms.length + 1,
    roomName,
    seatsAvailable,
    amenities,
    pricePerHour
  };
  rooms.push(room);
  res.status(201).json(room);
});

// 2. Book a room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  
  // Checking if the room is available
  const existingBooking = bookings.find(booking => booking.roomId === roomId && booking.date === date && !(booking.endTime <= startTime || booking.startTime >= endTime));
  if (existingBooking) {
    return res.status(400).json({ error: 'Room is already booked at the given time.' });
  }

  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId
  };
  bookings.push(booking);
  res.status(201).json(booking);
});

// 3. List all rooms with bookings
app.get('/rooms/bookings', (req, res) => {
  const roomBookings = rooms.map(room => {
    const bookingsForRoom = bookings.filter(booking => booking.roomId === room.id);
    return {
      roomName: room.roomName,
      bookedStatus: bookingsForRoom.length > 0 ? 'Booked' : 'Available',
      bookings: bookingsForRoom.map(booking => ({
        customerName: booking.customerName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime
      }))
    };
  });
  res.json(roomBookings);
});

// 4. List all customers with bookings
app.get('/customers/bookings', (req, res) => {
  const customerBookings = bookings.map(booking => {
    const room = rooms.find(room => room.id === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room.roomName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    };
  });
  res.json(customerBookings);
});

// 5. List booking details for a customer
app.get('/customers/:customerId/bookings', (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const customerBookings = bookings
    .filter(booking => booking.id === customerId)
    .map(booking => {
      const room = rooms.find(room => room.id === booking.id);
      return {
        customerName: booking.customerName,
        roomName: room.roomName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.id,
        bookingDate: booking.date,
        bookingStatus: booking.status
      };
    });
  res.json(customerBookings);
});


app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
