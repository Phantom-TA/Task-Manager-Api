import mongoose , { Schema } from 'mongoose';
import { AvailableTaskStatuses,TaskStatusEnum } from '../utils/constants.js';

const attachmentSchema = new Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
}, { _id: false }); // Prevent creation of _id for each attachment object

const taskSchema = new Schema({
    title:{
        type:String,
        required: true,
        trim:true
    },
    description:{
        type:String,
        
    },

    project:{
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    assignedTo:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    assignedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    status:{
        type:String,
        enum:AvailableTaskStatuses,
        default:TaskStatusEnum.TODO

    },
    attachments:{
         type: [
           attachmentSchema
        ],
        default: []
    }


},{timestamps:true});

export const Task = mongoose.model('Task', taskSchema);