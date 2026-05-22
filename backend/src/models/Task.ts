import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  time: string;
  class: string;
  completed: boolean;
  order: number;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    time: { type: String, required: true },
    class: { type: String, required: true },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }
);

export default mongoose.model<ITask>('Task', TaskSchema);
