import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  userId: Types.ObjectId; // actor
  targetUserId: Types.ObjectId; // whose data was accessed
  action: string; // "VIEW_PROFILE" | "EDIT_PROFILE" | etc.
  timestamp: Date;
  meta?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    meta: { type: Object, default: {} },
  },
  { timestamps: false }
);

export default model<IAuditLog>("AuditLog", AuditLogSchema);

