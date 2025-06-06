import { json } from 'express';
import Task from '../models/task.models.js'; 
import {asyncHandler} from '../utils/async-handler.js'
import { ApiResponse } from '../utils/api-response.js';
import SubTask  from '../models/subtask.models.js';

const getTasks = asyncHandler(async (req, res) => {
  // get all tasks
   const { projectId } = req.params;

   const tasks =await Task.find({project : projectId}).populate('assignedTo assignedBy project');
    res.status(200).json(
        new ApiResponse(200, { tasks , message: "All tasks fetched successfully" })
    );

});

// get task by id
const getTaskById = asyncHandler(async (req, res) => {
  // get task by id
 const { projectId , taskId } = req.params;
  
  const task =await Task.findOne({project: projectId , _id: taskId}).populate('assignedTo assignedBy project');
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
  const { projectId } = req.params
  const { title, description  , assignedTo , assignedBy , status , attachments } = req.body
  if(!title || !projectId || !assignedTo || !assignedBy)
    return res.status(404).json(
        new ApiResponse(404,{message: "Required fields are missing "})
    )

    const task = await Task.create({
        title, description ,project:projectId , assignedTo , assignedBy , status , attachments
    }
    )

    res.status(200).json(
        new ApiResponse(200,{task, message:"Task created successfully"})
    )
});

// update task
const updateTask = asyncHandler(async (req, res) => {
  // update task
  const { projectId,taskId } = req.params;
  const { title , description , status , attachments} = req.body;
  const task = await Task.findOne({_id :taskId , project:projectId})
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
  const { projectId , taskId } = req.params;
  const task = await Task.findOne({project : projectId,_id : taskId});
  if(!task)
    return res.status(404).json(
            new ApiResponse(404,{message:"Task not found"})
        )
  await SubTask.deleteMany({ task: taskId }); // Also delete all related subtasks
  await Task.findByIdAndDelete(id);

  res.status(200).json(
        new ApiResponse(200,{message: "Task deleted successfully"})
  )
});

// create subtask
const createSubTask = asyncHandler(async (req, res) => {
  // create subtask
   const { projectId, taskId} = req.params
   const { title , createdBy } = req.body;
   if(!title  || !createdBy)
   {
    return res.status(404).json(
        new ApiResponse(404,{message:"Required fields are missing"})
    )
   }
   const subTask = await SubTask.create({
    title , task:taskId , createdBy
   })
   res.status(200).json(
    new ApiResponse(200,{subTask , message:"Subtask created successfully"})
   )
});

// update subtask
const updateSubTask = asyncHandler(async (req, res) => {
  // update subtask
  const { projectId ,taskId , subTaskId } =req.params;
  const { title , isCompleted} =req.body;
  const subTask = await SubTask.findById(subTaskId);
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
    const { projectId , taskId , subTaskId } = req.params;
  const subTask = await SubTask.findById(subTaskId);
  if(!subTask)
    return res.status(404).json(
            new ApiResponse(404,{message:"Subtask not found"})
        )
  await SubTask.findByIdAndDelete(subTaskId ); // Also delete all related subtasks
  
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
