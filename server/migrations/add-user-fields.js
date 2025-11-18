import { connect } from "../config/db.js";
import User from "../models/user.js";

/**
 * Migration script to add age and address fields to existing users
 */
const migrateUserModel = async () => {
  try {
    // Connect to database
    await connect();
    console.log("Connected to database");

    // Get all users without age and address fields
    const users = await User.find({
      $or: [{ age: { $exists: false } }, { address: { $exists: false } }],
    });

    console.log(`Found ${users.length} users to update`);

    // Update each user by adding default age and address fields
    let updated = 0;
    for (const user of users) {
      // Using updateOne to modify the document
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            age: user.age || null,
            address: user.address || "",
          },
        }
      );
      updated++;
    }

    console.log(`Successfully updated ${updated} users`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateUserModel();
