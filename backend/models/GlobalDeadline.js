// models/GlobalDeadline.js
import mongoose from "mongoose";
const GlobalDeadlineSchema = new mongoose.Schema({
  deadline: { type: Date, required: true }
});
export default mongoose.model("GlobalDeadline", GlobalDeadlineSchema);
