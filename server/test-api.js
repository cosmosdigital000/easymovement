import axios from "axios";
import dotenv from "dotenv";
import chalk from "chalk"; // For colored output (optional, install with npm)

dotenv.config();

const API_URL = "http://localhost:3000/api";
let token = null;

const testAPIs = async () => {
  console.log(chalk.blue("============== API TESTING STARTED =============="));

  try {
    // 1. Test authentication
    console.log(chalk.yellow("\n---Testing Authentication---"));

    // Login to get token
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@admin.com", // Use a valid email from your database
      password: "prem", // Use a valid password
    });

    token = loginRes.data.token;
    console.log(chalk.green("✓ Login successful, token received"));

    // 2. Test unauthorized access (should fail)
    console.log(chalk.yellow("\n---Testing Unauthorized Access---"));
    try {
      await axios.get(`${API_URL}/booking/123`);
      console.log(
        chalk.red("✗ Unauthorized access succeeded when it should fail!")
      );
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(chalk.green("✓ Unauthorized access correctly rejected"));
      } else {
        throw error;
      }
    }

    // 3. Test authorized access
    console.log(chalk.yellow("\n---Testing Authorized Access---"));

    // Set auth header
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // Test booking endpoints
    const bookingsRes = await axios.get(
      `${API_URL}/booking/doctor-id-here`,
      config
    );
    console.log(chalk.green("✓ Get bookings successful"));

    // Test prescription endpoints
    const prescriptionsRes = await axios.get(
      `${API_URL}/prescription/doctor-id-here`,
      config
    );
    console.log(chalk.green("✓ Get prescriptions successful"));

    // Test public endpoint (should work without token)
    const doctorsRes = await axios.get(`${API_URL}/role/doctors`);
    console.log(chalk.green("✓ Public endpoint (get doctors) successful"));

    console.log(
      chalk.blue("\n=============== TESTING COMPLETE ===============")
    );
    console.log(chalk.green("✓ All tests passed successfully!"));
  } catch (error) {
    console.log(chalk.red("\n=============== TEST FAILED ==============="));
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    console.log("Status:", error.response ? error.response.status : "N/A");
    console.log(chalk.yellow("Possible issues:"));
    console.log("1. Server not running");
    console.log("2. Authentication middleware not correctly implemented");
    console.log("3. Invalid credentials or request data");
    console.log("4. Missing token in requests");
  }
};

testAPIs();
