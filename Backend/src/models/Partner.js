import mongoose from "mongoose"

const partnerSchema = mongoose.Schema(
    {
        partnerName:{
            type: String,
            required: false
        },
        link:{
            type: String,
            required: false
        },
        isActive:{
            type: Boolean,
            default: true
        },
        isDeleted:{
            type: Boolean,
            default: false
        },
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const Partner = mongoose.model('partner',partnerSchema);
export default Partner;