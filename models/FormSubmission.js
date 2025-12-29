// models/FormSubmission.js
import mongoose from "mongoose";
import mediaSchema from "./Media.js";

const formSubmissionSchema = new mongoose.Schema(
  {
    user: {
      name: { type: String, required: true },
      email: String,
      phone: String,
    },

    fields: {
      field1: [mediaSchema],
      field2: [mediaSchema],
      field3: [mediaSchema],
      field4: [mediaSchema],
      field5: [mediaSchema],
    },
  },
  { timestamps: true }
);

export default mongoose.model("FormSubmission", formSubmissionSchema);
