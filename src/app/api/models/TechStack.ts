import {model, models, Schema} from "mongoose";

// --- Model Definition ---
const TechStackSchema = new Schema({
    status: {type: String, enum: ["draft", "published"], default: "draft"},
    header: {
        badge: {type: String, default: "Our Tools"},
        title: {type: String, default: "Technical Stack"},
        subtitle: {type: String},
    },
    tools: [{
        id: {type: String, required: true},
        name: {type: String, required: true}, // e.g., "Containerization platform"
        imageUrl: {type: String},
        order: {type: Number, default: 0}
    }]
}, {timestamps: true});

export default models.TechStack || model("TechStack", TechStackSchema);