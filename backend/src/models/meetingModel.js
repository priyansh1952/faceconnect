import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
  user_id: { type: String, required: true },
  meetingCode: { type: String, required: true, unique: true },
  meetingDate: { type: Date, default: Date.now }, 
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };
