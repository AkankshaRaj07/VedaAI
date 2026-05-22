import mongoose, { Schema, Document } from 'mongoose';

export interface ILibrary extends Document {
  name: string;
  size: string;
  category: string;
  groundingCount: number;
  fileUrl: string;
  uploadedAt: Date;
}

const LibrarySchema = new Schema<ILibrary>(
  {
    name: { type: String, required: true },
    size: { type: String, required: true },
    category: { type: String, required: true },
    groundingCount: { type: Number, default: 0 },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }
);

export default mongoose.model<ILibrary>('Library', LibrarySchema);
