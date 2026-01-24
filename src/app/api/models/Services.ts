import {model, models, Schema} from "mongoose";

const ServicesSchema = new Schema(
    {
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        header: {
            badge: {type: String, default: "Our Expertise"},
            title: {type: String, default: "services Offered"},
            subtitle: {type: String, default: "Comprehensive digital solutions..."},
        },
        items: [
            {
                id: {type: String, required: true},
                title: {type: String, required: true},
                description: {type: String, required: true},
                icon: {type: String}, // Stores icon name/key for the frontend library
                order: {type: Number, default: 0},
            },
        ],
    },
    {timestamps: true}
);

export default models.Services || model("services", ServicesSchema);