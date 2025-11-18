import { connect } from "../config/db.js";
import { Booking } from "../models/booking.js";

/**
 * Migration script to update the booking model by removing visitType and issue fields
 */
const migrateBookingModel = async () => {
  try {
    // Connect to database
    await connect();
    console.log("Connected to database");

    // Get all bookings
    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} bookings to update`);

    // Update each booking by removing visitType and issue fields
    let updated = 0;
    for (const booking of bookings) {
      // Using updateOne to modify the document
      await Booking.updateOne(
        { _id: booking._id },
        { $unset: { visitType: "", issue: "" } }
      );
      updated++;
    }

    console.log(`Successfully updated ${updated} bookings`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateBookingModel();
