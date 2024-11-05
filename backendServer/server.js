import express from "express";
import dotenv from "dotenv";
import connectToMongoDB from './db/connectToMongoDB.js';
import Airtable from "airtable";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const airtableBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appJxYkGLXrTQ7RWb');

const repairSchema = new mongoose.Schema({
  _id: String,
  firstName: String,
  lastName: String,
  itemType: String,
  damageDescription: String,
  repairCost: Number,
  status: String,
  dateSubmitted: Date,
  photoURL: String
}, { _id: false });

const Repair = mongoose.model("Repair", repairSchema);

async function syncAirtableToMongoDB() {
  try {
    airtableBase('Grid view').select({
      view: "Grid view"
    }).eachPage(async (records, fetchNextPage) => {
      const updates = records.map(record => {
        const repairData = {
          _id: record.id,  
          firstName: record.get('First Name'),
          lastName: record.get('Last Name'),
          itemType: record.get('Item Type'),
          damageDescription: record.get('Damage Description'),
          repairCost: record.get('Repair Cost'),
          status: record.get('Status'),
          dateSubmitted: new Date(record.get('Date Submitted')),  
          photoURL: record.get('Photo (URL)')
        };
        
        return Repair.updateOne(
          { _id: record.id }, 
          { $set: repairData }, 
          { upsert: true }  
        );
      });

      await Promise.all(updates);
      fetchNextPage();
    }, function done(err) {
      if (err) {
        console.error('Error syncing data from Airtable to MongoDB:', err);
      } else {
        console.log('Airtable data synced to MongoDB successfully.');
      }
    });
  } catch (error) {
    console.error('Error during sync process:', error);
  }
}

app.post("/sync", async (req, res) => {
  try {
    await syncAirtableToMongoDB();
    res.status(200).send("Sync successful.");
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).send("Sync failed.");
  }
});

async function startSync() {
  await syncAirtableToMongoDB(); 
  setInterval(syncAirtableToMongoDB, 1000 * 60 * 60); 
}

app.get("/", (req, res) => {
  res.send("Sync");
});

app.listen(PORT, async () => {
  await connectToMongoDB(); 
  startSync(); 
  console.log(`Server Running on port ${PORT}`);
});
