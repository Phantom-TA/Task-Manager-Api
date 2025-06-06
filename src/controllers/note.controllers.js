// boilderplate code
import {asyncHandler}  from "../utils/async-handler.js";
import ProjectNote from "../models/note.models.js"
import { ApiResponse } from "../utils/api-response";


const getNotes = asyncHandler(async (req, res) => {
  // get all notes
  const { projectId }=req.params
  const notes =await ProjectNote.find({project:projectId}).populate('project createdBy');
    res.status(200).json(
        new ApiResponse(200, { notes, message: "All Notes fetched successfully" })
    );
});

const getNoteById = asyncHandler(async (req, res) => {
  // get note by id
  const { noteId } = req.params;
  
  const note =await ProjectNote.findById(noteId).populate('project createdBy');
  if (!note) {
    return res.status(404).json(
      new ApiResponse(404, { message: "Note not found" })
    );
  }
  res.status(200).json(
    new ApiResponse(200, { note, message: "Project Note fetched successfully" })
  );
});

const createNote = asyncHandler(async (req, res) => {
  // create note
  const { projectId }= req.params 
  const {  createdBy , content } =req.body;
  if(!projectId || !createdBy)
      return res.status(400).json(
      new ApiResponse(400, { message: "Required fields are missing " })
    );

    const note = await ProjectNote.create({
      project: projectId , createdBy , content 
    })
    res.status(200).json(
      new ApiResponse(200, { note, message: "Project Note created successfully" })
    )
});

const updateNote =asyncHandler( async (req, res) => {
  // update note
   const { projectId , noteId } =req.params;
    const { content } =req.body;
    const note = await ProjectNote.findById(noteId);
    if(!note)
      return res.status(404).json(
          new ApiResponse(404,{message:"Project note not found"})
      )
  
     note.content = content || note.content
  
      await note.save();
      res.status(200).json(
      new ApiResponse(200,{ note, message:"Project Note updated successfully"})
     )

});

const deleteNote = asyncHandler(async (req, res) => {
  // delete note
   const { noteId , projectId } = req.params;
  const note = await ProjectNote.findById(noteId);
  if(!note)
    return res.status(404).json(
            new ApiResponse(404,{message:"Project Note not found"})
        )
  await ProjectNote.findByIdAndDelete(noteId );
  
  res.status(200).json(
        new ApiResponse(200,{message: "Project note deleted successfully"})
  )
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
