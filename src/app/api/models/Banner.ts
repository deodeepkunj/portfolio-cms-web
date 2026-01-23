import {model, models, Schema} from "mongoose";

const BannerSchema = new Schema(
    {
        badge: {type: String, required: true},

        headline: {
            line1: {type: String, required: true},
            line2: {type: String, required: true},
        },

        description: {type: String, required: true},

        ctas: [
            {
                id: String,
                label: String,
                action: String,
                phone: String,
                message: String,
                url: String,
            },
        ],

        /* ✅ THIS WAS MISSING */
        featured: {
            title: {type: String, required: true},
            description: {type: String, required: true},
        },
    },
    {timestamps: true}
);

export default models.Banner || model("Banner", BannerSchema);