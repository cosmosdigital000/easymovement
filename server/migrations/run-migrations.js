import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Running database migrations...");

// Run migration to remove unused booking fields
console.log("Migration 1: Removing unused booking fields");
exec(
  `node ${path.join(__dirname, "remove-unused-booking-fields.js")}`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(stdout);

    // Run migration to add user fields
    console.log("Migration 2: Adding new user fields");
    exec(
      `node ${path.join(__dirname, "add-user-fields.js")}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return;
        }
        console.log(stdout);
        console.log("All migrations completed successfully!");
      }
    );
  }
);
