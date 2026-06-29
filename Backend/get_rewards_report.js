import mongoose from "mongoose";
import fs from "fs";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function generateReport() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URL);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;

    const report = await db.collection("rewards").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transactionData"
        }
      },
      { $unwind: { path: "$transactionData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "cinemas",
          localField: "transactionData.cinemaId",
          foreignField: "_id",
          as: "cinemaData"
        }
      },
      { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "regions",
          localField: "cinemaData.regionId",
          foreignField: "_id",
          as: "regionData"
        }
      },
      { $unwind: { path: "$regionData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            cinemaName: { $ifNull: ["$cinemaData.cinemaName", "General/No Cinema"] },
            location: { $ifNull: ["$regionData.region", "Unknown Location"] },
            userEmail: { $ifNull: ["$userData.email", "N/A"] },
            userName: { $concat: [ { $ifNull: ["$userData.firstName", ""] }, " ", { $ifNull: ["$userData.lastName", ""] } ] }
          },
          totalEarnedPoints: {
            $sum: {
              $cond: [
                { $eq: ["$type", "earned"] },
                "$coins",
                0
              ]
            }
          },
          totalRedeemedPoints: {
            $sum: {
              $cond: [
                { $eq: ["$type", "earned"] },
                "$redeemCoins",
                0
              ]
            }
          },
          totalPendingPoints: {
            $sum: {
              $cond: [
                { $eq: ["$type", "earned"] },
                "$remainingCoins",
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          cinemaName: "$_id.cinemaName",
          location: "$_id.location",
          userEmail: "$_id.userEmail",
          userName: "$_id.userName",
          totalEarnedPoints: 1,
          totalRedeemedPoints: 1,
          totalPendingPoints: 1
        }
      },
      {
        $sort: { location: 1, cinemaName: 1 }
      }
    ]).toArray();

    console.log(`Retrieved ${report.length} records. Generating CSV...`);

    let csvContent = "Location,Cinema Name,User Name,User Email,Total Earned Points,Total Redeemed Points,Pending/Active Points\n";
    report.forEach((row) => {
      // Escape values for CSV safety
      const location = (row.location || "").replace(/"/g, '""');
      const cinemaName = (row.cinemaName || "").replace(/"/g, '""');
      const userName = (row.userName || "").trim().replace(/"/g, '""');
      const userEmail = (row.userEmail || "").replace(/"/g, '""');
      csvContent += `"${location}","${cinemaName}","${userName}","${userEmail}",${row.totalEarnedPoints},${row.totalRedeemedPoints},${row.totalPendingPoints}\n`;
    });

    fs.writeFileSync("rewards_by_cinema_report.csv", csvContent);
    console.log("Report generated successfully as 'rewards_by_cinema_report.csv'!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error generating report:", error);
  }
}

generateReport();
