import { json } from 'express';
import Task from '../models/task.models.js'; 
import {asyncHandler} from '../utils/async-handler.js'
import { ApiResponse } from '../utils/api-response.js';
import SubTask  from '../models/subtask.models.js';

const getTasks = asyncHandler(async (req, res) => {
  // get all tasks
   const tasks =await Task.find().populate('assignedTo assignedBy project');
    res.status(200).json(
        new ApiResponse(200, { tasks , message: "All tasks fetched successfully" })
    );

});

// get task by id
const getTaskById = asyncHandler(async (req, res) => {
  // get task by id
 const { id } = req.params;
  
  const task =await Task.findById(id).populate('assignedTo assignedBy project');
  if (!task) {
    return res.status(404).json(
      new ApiResponse(404, { message: "Task not found" })
    );
  }
  res.status(200).json(
    new ApiResponse(200, { task, message: "Task fetched successfully" })
  );
});

// create task
const createTask = asyncHandler(async (req, res) => {
  // create task
  const { title, description ,project , assignedTo , assignedBy , status , attachments } = req.body
  if(!title || !project || !assignedTo || !assignedBy)
    return res.status(404).json(
        new ApiResponse(404,{message: "Required fields are missing "})
    )

    const task = await Task.create({
        title, description ,project , assignedTo , assignedBy , status , attachments
    }
    )

    res.status(200).json(
        new ApiResponse(200,{task, message:"Task created successfully"})
    )
});

// update task
const updateTask = asyncHandler(async (req, res) => {
  // update task
  const { id } = req.params;
  const { title , description , status , attachments} = req.body;
  const task = await Task.findById(id)
  if(!task)
    return res.status(404).json(
        new ApiResponse(404,{message:"Task not found"})
    )
   task.title=title || task.title;
   task.description =description || task.description
   task.status = status || task.status
   task.attachments = attachments  || task.attachments

   await task.save();

   res.status(200).json(
  new ApiResponse(200, { task, message: "Task updated successfully" })
);
});

// delete task
const deleteTask =asyncHandler( async (req, res) => {
  // delete task
  const { id } = req.params;
  const task = await Task.findById(id);
  if(!task)
    return res.status(404).json(
            new ApiResponse(404,{message:"Task not found"})
        )
  await SubTask.deleteMany({ task: id }); // Also delete all related subtasks
  await Task.findByIdAndDelete(id);

  res.status(200).json(
        new ApiResponse(200,{message: "Task deleted successfully"})
  )
});

// create subtask
const createSubTask = asyncHandler(async (req, res) => {
  // create subtask
   const { title , task , createdBy } = req.body;
   if(!title || !task || !createdBy)
   {
    return res.status(404).json(
        new ApiResponse(404,{message:"Required fields are missing"})
    )
   }
   const subTask = await SubTask.create({
    title , task , createdBy
   })
   res.status(200).json(
    new ApiResponse(200,{subTask , message:"Subtask created successfully"})
   )
});

// update subtask
const updateSubTask = asyncHandler(async (req, res) => {
  // update subtask
  const { id } =req.params;
  const { title , isCompleted} =req.body;
  const subTask = await SubTask.findById(id);
  if(!subTask)
    return res.status(404).json(
        new ApiResponse(404,{message:"subtask not found"})
    )

    subTask.title  =title ||  subTask.title ;
    subTask.isCompleted = typeof isCompleted === "boolean" ? isCompleted : subTask.isCompleted;

    await subTask.save();
    res.status(200).json(
    new ApiResponse(200,{ subTask, message:"Subtask updated successfully"})
   )
});

// delete subtask
const deleteSubTask =asyncHandler( async (req, res) => {
  // delete subtask
    const { id } = req.params;
  const subTask = await SubTask.findById(id);
  if(!subTask)
    return res.status(404).json(
            new ApiResponse(404,{message:"Subtask not found"})
        )
  await SubTask.findByIdAndDelete(id ); // Also delete all related subtasks
  
  res.status(200).json(
        new ApiResponse(200,{message: "Subtask deleted successfully"})
  )
});

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
