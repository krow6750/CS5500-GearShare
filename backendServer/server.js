import express from "express";
import dotenv from "dotenv";
import Airtable from "airtable";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const airtableBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appJxYkGLXrTQ7RWb'); // Repair Tickets Base
const userBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appWQDpdrrzIpTBff'); // Users Base

app.use(express.json());


app.get("/airtable-data", async (req, res) => {
  try {
    const records = [];
    await airtableBase('Grid view').select({
      view: "Grid view"
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(record => {
        records.push({
          id: record.id,
          firstName: record.get("First Name"),
          lastName: record.get("Last Name"),
          itemType: record.get("Item Type"),
          damageDescription: record.get("Damage Description"),
          repairCost: record.get("Repair Cost"),
          status: record.get("Status"),
          dateSubmitted: record.get("Date Submitted"),
          photoURL: record.get("Photo (URL)")
        });
      });
      fetchNextPage();
    });

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    res.status(500).send("Failed to fetch data from Airtable.");
  }
});

app.put("/update-airtable-entry/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (!id.startsWith("rec")) {
      return res.status(400).send("Invalid record ID format.");
    }

    console.log("Received updates:", updates);
    console.log("Record ID:", id);

    const updatedRecord = await airtableBase('Grid view').update(id, updates);

    res.status(200).json({
      message: "Record updated successfully",
      updatedRecord: updatedRecord.fields
    });
  } catch (error) {
    console.error("Error updating Airtable record:", error);
    res.status(500).send(error.message || "Failed to update Airtable record.");
  }
});

app.post("/sync", async (req, res) => {
  try {
    console.log("Starting manual sync...");
    const records = [];
    await airtableBase('Grid view').select({
      view: "Grid view"
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(record => {
        records.push({
          id: record.id,
          firstName: record.get("First Name"),
          lastName: record.get("Last Name"),
          itemType: record.get("Item Type"),
          damageDescription: record.get("Damage Description"),
          repairCost: record.get("Repair Cost"),
          status: record.get("Status"),
          dateSubmitted: record.get("Date Submitted"),
          photoURL: record.get("Photo (URL)")
        });
      });
      fetchNextPage();
    });

    console.log("Sync completed. Records fetched:", records.length);
    res.status(200).json({
      message: "Sync successful",
      recordCount: records.length,
      records
    });
  } catch (error) {
    console.error("Error during sync:", error);
    res.status(500).send("Sync failed.");
  }
});


app.get("/users", async (req, res) => {
  try {
    const records = [];
    await userBase('Users').select({
      view: "Grid view"
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(record => {
        console.log("Fetched user record:", record.fields); 
        records.push({
          id: record.id,
          lastName: record.get("Last Name") || "N/A",
          firstName: record.get("First Name") || "N/A",
          email: record.get("Email") || "N/A",
          password: record.get("Password") || "N/A",
          authentication: record.get("Authentication") || "N/A",
        });
      });
      fetchNextPage();
    });

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching users:", error.message, error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("All fields (firstName, lastName, email, password) are required.");
  }

  try {
    const newUser = await userBase('Users').create({
      "Last Name": lastName,
      "First Name": firstName,
      "Email": email,
      "Password": password,
      "Authentication": "ordinary"
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.fields
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Failed to register user.");
  }
});

app.put("/update-user/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (!id.startsWith("rec")) {
      return res.status(400).send("Invalid record ID format.");
    }

    const updatedUser = await userBase('Users').update(id, updates);

    res.status(200).json({
      message: "User updated successfully",
      updatedUser: updatedUser.fields
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Failed to update user.");
  }
});

app.delete("/delete-user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!id.startsWith("rec")) {
      return res.status(400).send("Invalid record ID format.");
    }

    await userBase('Users').destroy(id);

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Failed to delete user.");
  }
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
