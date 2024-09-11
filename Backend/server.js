import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

//  seat number and booked status
let seats = Array.from({ length: 80 }, (_, i) => ({
  SeatNumber: i + 1,
  IsBooked: false,
}));

// Function to find and book seats
function findAndBookSeats(requestedSeats) {
  const availableSeats = seats.filter((seat) => !seat.IsBooked);

  // Check if we have enough seats
  if (availableSeats.length < requestedSeats) {
    return { bookedSeats: [], message: "Not enough seats available" };
  }

  // Priority booking within the same row
  for (let row = 0; row < 11; row++) {
    const start = row * 7;
    const rowSeats =
      row === 10
        ? availableSeats.slice(start, start + 3)
        : availableSeats.slice(start, start + 7);

    if (rowSeats.length >= requestedSeats) {
      const booked = rowSeats.slice(0, requestedSeats);
      booked.forEach((seat) => (seats[seat.SeatNumber - 1].IsBooked = true));
      return {
        bookedSeats: booked.map((seat) => seat.SeatNumber),
        message: "Seats booked successfully",
      };
    }
  }

  // Booking nearby if a whole row is not available
  const booked = availableSeats.slice(0, requestedSeats);
  booked.forEach((seat) => (seats[seat.SeatNumber - 1].IsBooked = true));

  return {
    bookedSeats: booked.map((seat) => seat.SeatNumber),
    message: "Seats booked successfully",
  };
}

// Route to handle seat booking
app.post("/book", (req, res) => {
  const { seats: requestedSeats } = req.body;

  // If requestedSeats is 0, just return the current status without booking
  if (requestedSeats === 0) {
    return res.json({
      bookedSeats: [],
      message: "Fetched seats",
      allSeats: seats,
    });
  }

  const { bookedSeats, message } = findAndBookSeats(requestedSeats);
  res.json({ bookedSeats, message, allSeats: seats });
});

// Example endpoint in your Express.js server

app.post("/reset", (req, res) => {
  // Reset all seats to available in the database
  seats = seats.map((seat) => ({ ...seat, IsBooked: false })); // Assuming `seats` is your array of seat objects
  res.json({ message: "All seats have been reset to available." });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
