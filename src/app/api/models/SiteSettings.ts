import { model, models, Schema } from "mongoose";

const SiteSettingsSchema = new Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    maintenance: {
      title: { type: String, default: "We'll Be Right Back" },
      message: {
        type: String,
        default:
          "We're performing scheduled maintenance. We'll be back shortly.",
      },
      estimatedTime: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
