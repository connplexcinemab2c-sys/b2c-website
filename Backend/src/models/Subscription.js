import mongoose from "mongoose";

  const subscriptionSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: false,
      },
      price: {
        type: Number,
        required: false,
      },
      discountedPrice: {
        type: Number,
        required: false,
      },
      discountOfFAndB: {
        type: String,
        required: false,
      },
      discountOnTicket: {
        type: String,
        required: false,
      },
      freeTicket: {
        type: String,
        required: false,
      },
      priorityBooking: {
        type: String,
        required: false,
      },
      accessToExclusiveScreening: {
        type: String,
        required: false,
      },
      guestPasses: {
        type: String,
        required: false,
      },
      specialEventAccess: {
        type: String,
        required: false,
      },
      earlyAccessToTickets: {
        type: String,
        required: false,
      },
      support: {
        type: String,
        required: false,
      },
      coins: {
        type: String,
        required: false,
      },
      welcomeGift: {
        type: String,
        required: false,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      deletedStatus: {
        type: Number,
        default: 0,
      },
      isDiscounted: {
        type: Boolean,
        default: false,
      },
      status:{
        type: String,
        default: "Draft",
        enum: ["Draft", "Requested", "Approved", "Rejected"],
      },
      isPublished:{
        type: Boolean,
        default:false
      },
      // monthlyAccess: {
      //   type: String,
      //   required: false,
      // },
      yearlyAccess :{
        type: String,
        required: false,
      }
    },
    { timestamps: true , strict:false}
  );

  const Subscription = mongoose.model("subscription", subscriptionSchema);
  export default Subscription;
