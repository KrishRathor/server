import { Schema, model, Types, Document } from "mongoose";

export interface IReminder extends Document {
  userId: Types.ObjectId;
  title: string;
  dueDate: Date;
  recurrence: "none" | "yearly" | "monthly";
  sent: boolean;
}

const ReminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    recurrence: {
      type: String,
      enum: ["none", "yearly", "monthly"],
      default: "none",
    },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IReminder>("Reminder", ReminderSchema);

