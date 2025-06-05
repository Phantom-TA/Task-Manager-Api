// boilderplate code
import {asyncHandler}  from "../utils/async-handler.js";
import ProjectNote from "../models/note.models.js"
import { ApiResponse } from "../utils/api-response";


const getNotes = asyncHandler(async (req, res) => {
  // get all notes
  const notes =await ProjectNote.find().populate('project createdBy');
    res.status(200).json(
        new ApiResponse(200, { notes, message: "All Notes fetched successfully" })
    );
});

const getNoteById = asyncHandler(async (req, res) => {
  // get note by id
  const { id } = req.params;
  
  const note =await ProjectNote.findById(id).populate('project createdBy');
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
  const { project , createdBy , content } =req.body;
  if(!project || !createdBy)
      return res.status(400).json(
      new ApiResponse(400, { message: "Required fields are missing " })
    );

    const note = await ProjectNote.create({
      project , createdBy , content 
    })
    res.status(200).json(
      new ApiResponse(200, { note, message: "Project Note created successfully" })
    )
});

const updateNote =asyncHandler( async (req, res) => {
  // update note
   const { id } =req.params;
    const { content } =req.body;
    const note = await ProjectNote.findById(id);
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
   const { id } = req.params;
  const note = await ProjectNote.findById(id);
  if(!note)
    return res.status(404).json(
            new ApiResponse(404,{message:"Project Note not found"})
        )
  await ProjectNote.findByIdAndDelete(id );
  
  res.status(200).json(
        new ApiResponse(200,{message: "Project note deleted successfully"})
  )
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
