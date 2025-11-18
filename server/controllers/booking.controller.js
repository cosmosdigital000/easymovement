import { Booking } from "../models/booking.js";
import User from "../models/user.js";
import mongoose from "mongoose";

export const GetBookings = async (req, res) => {
  const { id } = req.params;

  try {
    let doctorId;

    // Check if the id is a MongoDB ObjectId (doctor's MongoDB ID directly)
    if (mongoose.Types.ObjectId.isValid(id)) {
      doctorId = id;
    } else {
      // If it's not a valid ObjectId, try to find by email or other identifier if needed
      return res.status(400).json({ message: "Invalid doctor ID format" });
    }

    // Always fully populate the user field to ensure consistent data format
    const bookings = await Booking.find({ doctor: doctorId })
      .populate({
        path: "user",
        select: "full_name email phoneNumber _id",
        model: "User",
      })
      .sort({ date: -1, time: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in GetBookings:", error);
    res.status(500).json({ message: error.message });
  }
};

// Return all bookings for doctors (with populated user and doctor details)
export const GetAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate({
        path: "user",
        select: "full_name email phoneNumber _id",
        model: "User",
      })
      .populate({
        path: "doctor",
        select: "full_name email _id",
        model: "User",
      })
      .sort({ date: -1, time: -1 });

    // Always return an array (possibly empty) to simplify client handling
    return res.status(200).json(bookings || []);
  } catch (error) {
    console.error("Error in GetAllBookings:", error);
    res.status(500).json({ message: error.message });
  }
};

export const GetBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // Populate user details here too for consistency
    const booking = await Booking.findById(id).populate({
      path: "user",
      select: "full_name email phoneNumber _id",
      model: "User",
    });

    if (!booking) {
      return res.status(404).json({ message: "No booking found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const GetUserBookings = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find all bookings for this specific user
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "doctor",
        select: "full_name email _id",
        model: "User",
      })
      .sort({ date: -1, time: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json([]); // Return empty array instead of 404 error
    }

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in GetUserBookings:", error);
    res.status(500).json({ message: error.message });
  }
};

export const CreateBooking = async (req, res) => {
  const {
    date,
    time,
    doctor,
    email,
    phoneNumber,
    full_name,
    age,
    address,
    user,
  } = req.body;

  try {
    let userId;

    if (user) {
      // If an authenticated user is booking
      userId = user;
    } else if (email || phoneNumber) {
      // For non-authenticated users, check if the email or phone number exists
      let existingUser = null;
      
      if (email) {
        existingUser = await User.findOne({ email });
      }
      
      if (!existingUser && phoneNumber) {
        existingUser = await User.findOne({ phoneNumber });
      }

      if (existingUser) {
        // Use existing user
        userId = existingUser._id;

        // Update user info if new data is provided (but don't change unique fields)
        const updateData = {};
        if (full_name && full_name !== existingUser.full_name) updateData.full_name = full_name;
        if (age && age !== existingUser.age) updateData.age = age;
        if (address && address !== existingUser.address) updateData.address = address;

        // Only update email if it's different and not already taken
        if (email && email !== existingUser.email) {
          const emailExists = await User.findOne({ email, _id: { $ne: existingUser._id } });
          if (!emailExists) {
            updateData.email = email;
          }
        }

        // Only update phone number if it's different and not already taken
        if (phoneNumber && phoneNumber !== existingUser.phoneNumber) {
          const phoneExists = await User.findOne({ phoneNumber, _id: { $ne: existingUser._id } });
          if (!phoneExists) {
            updateData.phoneNumber = phoneNumber;
          }
        }

        if (Object.keys(updateData).length > 0) {
          await User.findByIdAndUpdate(userId, updateData);
        }
      } else {
        // Create a new user record for non-authenticated booking
        // This ensures we have a valid User record for prescriptions
        const newUser = new User({
          full_name,
          email: email || undefined,
          phoneNumber: phoneNumber || undefined,
          age: age || undefined,
          address: address || undefined,
          role: "user", // Default role for patients
          password: "temp_password_" + Date.now(), // Temporary password, user can reset later
        });
        
        const savedUser = await newUser.save();
        userId = savedUser._id;
      }
    } else {
      return res.status(400).json({ message: "Email or phone number is required for booking" });
    }

    // Check if booking already exists for this user, doctor, date, and time
    const existingBooking = await Booking.findOne({
      user: userId,
      doctor,
      date,
      time,
    });

    if (existingBooking) {
      return res.status(409).json({ 
        message: "You already have a booking with this doctor on this date and time" 
      });
    }

    // Create the booking with patient details
    const newBooking = new Booking({
      date,
      time,
      user: userId,
      doctor,
      // Store patient details directly in the booking
      patientName: full_name,
      patientEmail: email,
      patientPhone: phoneNumber,
      patientAge: age,
      patientAddress: address,
    });

    await newBooking.save();

    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.phoneNumber) {
        return res.status(409).json({ 
          message: "A user with this phone number already exists. Please use a different phone number or contact support." 
        });
      }
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(409).json({ 
          message: "A user with this email already exists. Please use a different email or contact support." 
        });
      }
    }
    
    res.status(500).json({ message: "Failed to create booking. Please try again." });
  }
};

export const UpdateBooking = async (req, res) => {
  const { id } = req.params;
  const booking = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No booking with id: ${id}`);

    const updatedBooking = await Booking.findByIdAndUpdate(id, booking, {
      new: true,
    }).populate({
      path: "user",
      select: "full_name email phoneNumber _id",
      model: "User",
    });

    res.json(updatedBooking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const DeleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No booking with id: ${id}`);

    await Booking.findByIdAndDelete(id);

    res.json({ message: "Booking deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const slotAvailability = async (req, res) => {
  const { date, time, doctorId } = req.body;
  if (!doctorId) {
    return res.status(400).json({ message: "Doctor ID is required" });
  }

  try {
    const booking = await Booking.findOne({ doctor: doctorId, date, time });

    if (!booking) {
      return res.status(200).json({ message: "Slot is available" });
    }

    res.status(409).json({ message: "Slot is not available" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getBookingId = async (req, res) => {
  const { userId, doctorId } = req.params;
  try {
    const booking = await Booking.findOne({
      user: userId,
      doctor: doctorId,
    });

    if (!booking) {
      return res.status(404).json({ message: "No booking found" });
    }

    const bookingId = booking._id.toString(); // Convert ObjectId to string
    res.status(200).json({ bookingId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
