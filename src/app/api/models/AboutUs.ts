import {model, models, Schema} from "mongoose";

const AboutUsSchema = new Schema(
    {
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },

        header: {
            badge: String,
            title: String,
            subtitle: String,
        },

        hero: {
            imageUrl: String,
            yearsOfExperience: Number,
        },

        content: {
            heading: String,
            paragraphs: [String],
        },

        features: [
            {
                id: String,
                icon: String,
                text: String,
                order: Number,
            },
        ],
    },
    {timestamps: true}
);

export default models.AboutUs || model("AboutUs", AboutUsSchema);