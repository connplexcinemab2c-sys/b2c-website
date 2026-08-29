import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect('mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin');
    const db = mongoose.connection.db;
    
    console.log("Simulating aggregation for WTHRB5F...");
    const pipeline = [
      { $match: { "addSeatData.strBookId": "WTHRB5F" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                email: 1,
                firstName: 1,
                lastName: 1,
                mobileNumber: 1,
              },
            },
          ],
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                cinemaName: 1,
                address: 1,
                googleUrl: 1,
                emailId: 1,
              },
            },
          ],
          as: "cinemaData",
        },
      },
      { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                category: 1,
                poster: 1,
                uniqueFilmCode: 1,
                movieType: 1,
              },
            },
          ],
          as: "movieData",
        },
      },
      { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "shows",
          localField: "showId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                screenName: 1,
                sessionRealShow: 1,
              },
            },
          ],
          as: "showData",
        },
      },
      { $unwind: { path: "$showData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          initTransId: 1,
          bookedFrom: 1,
          status: 1,
          cancellationPolicy: 1,
          paymentsStatus: 1,
          commitStatus: 1,
          deletedStatus: 1,
          refundStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          paymentsBreakup: 1,
          couponData: 1,
          finalBookingCalculation: 1,
          rewardData: 1,
          "paymentResponse.id": 1,
          "paymentResponse.amount": 1,
          "paymentResponse.order_status": 1,
          "paymentResponse.payment_mode": 1,
          "paymentResponse.order_id": 1,
          "paymentResponse.tracking_id": 1,
          "paymentResponse.status": 1,
          "paymentResponse.method": 1,
          "cinemaData.cinemaName": 1,
          "cinemaData.address": 1,
          "cinemaData.googleUrl": 1,
          "cinemaData.emailId": 1,
          "movieData.name": 1,
          "movieData.category": 1,
          "movieData.poster": 1,
          "movieData.movieType": 1,
          "showData.screenName": 1,
          "showData.sessionRealShow": 1,
          "userData.email": 1,
          "userData.mobileNumber": 1,
          "userData.firstName": 1,
          "userData.lastName": 1,
          "commitBookingData.strBookId": 1,
          "commitBookingData.strSeatInfo": 1,
          "commitBookingData.curTicketsTax3": 1,
          "addSeatData.strBookId": 1,
          "addSeatData.curTotal": 1,
          "addSeatData.curTicketsTotal": 1,
          "addSeatData.strSeatInfo": 1,
          "addSeatData.curTicketsTax3": 1,
          fAndBDetails: 1,
          "foodAndBvgResponse.curTotal": 1,
          "foodAndBvgResponse.curTicketsTotal": 1,
          "foodAndBvgResponse.curFoodTotal": 1,
          "setSeatData.strSeatInfo": 1,
          logs: 1,
        }
      }
    ];

    const res = await db.collection("transactions").aggregate(pipeline).toArray();
    console.log("Aggregation Result:");
    console.log(JSON.stringify(res[0], null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
