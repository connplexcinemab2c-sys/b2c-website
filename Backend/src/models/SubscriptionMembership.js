import mongoose from "mongoose";

const subscriptionMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "subscription",
    },
    initTransId: {
      type: String,
      required: false,
    },
    subscriptionDetails: {
      discountOfFAndB: {
        type: String,
        required: false,
      },
      discountOnTicket: {
        type: String,
        required: false,
      },
      discountOnEcommerce: {
        type: String,
        required: false,
      },
      discountOfFAndBUpTo: {
        type: String,
        required: false,
      },
      discountOnTicketUpTo: {
        type: String,
        required: false,
      },
      discountOnEcommerceUpTo: {
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
      price: {
        type: Number,
        required: false,
      },
      discountedPrice: {
        type: Number,
        required: false,
      },
      isDiscounted: {
        type: Boolean,
        required: false,
      },
      membershipDuration: {
        type: Number,
        required: false,
      },
    },

    subscriptionStartDate: {
      type: Date,
      required: false,
    },
    subscriptionEndDate: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
    },
    upgradePlan: {
      type: Boolean,
      required: false,
    },
    upgradePlanDate: {
      type: Date,
      required: false,
    },
    upgradePretoPost: {
      type: String,
      required: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionMembership = mongoose.model(
  "subscriptionMembership",
  subscriptionMembershipSchema
);

export default SubscriptionMembership;
