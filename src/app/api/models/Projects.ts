import {model, models, Schema} from "mongoose";

const ProjectItemSchema = new Schema({
    id: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    imageUrl: {type: String},
    technologies: [{type: String}], // e.g., ["Next.js", "Node.js"]
    order: {type: Number, default: 0},
    projectUrl: {type: String, default: ""}
});

const ProjectsSchema = new Schema(
    {
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        header: {
            badge: {type: String, default: "Our Work"},
            title: {type: String, default: "Featured Projects"},
            subtitle: {type: String},
        },
        items: [ProjectItemSchema],
    },
    {timestamps: true}
);

export default models.Projects || model("Projects", ProjectsSchema);