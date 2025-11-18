import { Schema, model, Document, Types } from "mongoose";

export interface IGoal extends Document {
  userId: Types.ObjectId;
  type: string; // "steps" | "sleep" | "water" | "custom"
  target: number;
  unit: string;
  progress: number;
  date: Date;
  status: "met" | "missed" | "in-progress";
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    target: { type: Number, required: true },
    unit: { type: String, required: true },
    progress: { type: Number, default: 0 },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["met", "missed", "in-progress"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

export default model<IGoal>("Goal", GoalSchema);

