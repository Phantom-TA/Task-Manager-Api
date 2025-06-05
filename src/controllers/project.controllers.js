import {asyncHandler} from '../utils/async-handler.js';
import Project from '../models/project.model.js';
import { ApiResponse } from '../utils/api-response';
import { ProjectMember } from '../models/projectmember.models.js';
import { UserRolesEnum } from '../utils/constants';


const getProjects = asyncHandler( async (req, res) => {
  // get all projects
    const projects =await Project.find();
    res.status(200).json(
        new ApiResponse(200, { projects , message: "All Projects fetched successfully" })
    );

});

const getProjectById = asyncHandler(async (req, res) => {
  // get project by id
  const { id } = req.params;
  
  const project =await Project.findById(id);
  if (!project) {
    return res.status(404).json(
      new ApiResponse(404, { message: "Project not found" })
    );
  }
  res.status(200).json(
    new ApiResponse(200, { project, message: "Project fetched successfully" })
  );
});

const createProject = asyncHandler(async (req, res) => {
    
  // create project
    const { name, description  } = req.body;
    if (!name ) {
    return res.status(400).json(
      new ApiResponse(400, { message: "All fields are required" })
    );
 
    }
    const createdBy = req.user.id
    const existingProject = await Project.findOne({name});
    if(existingProject)
         return res.status(400).json(
                new ApiResponse(400,{message: 'Project name already exists'})
         )
   const project = await Project.create({
    name,
    description,
    createdBy,
    
   });          
   
   if(!project) {
            return res.status(400).json(
                new ApiResponse(400,{
                message: 'Project creation failed'}
                )
            )
        }

  await ProjectMember.create({
    user: createdBy,
    project: project._id,
    role: UserRolesEnum.PROJECT_ADMIN
    });
    return res.status(200).json(
        new ApiResponse(200,{message:'Project created successfully'})
    )    

});

const updateProject = asyncHandler(async (req, res) => {
 // update project
   
 
    
   const { projectId }= req.params;
   const project = await Project.findById(projectId);
   if(!project){
    return res.status(404).json(
          new ApiResponse(404,{message : "Project not found"})
        )
    }

    const { name , description } =req.body;
     if (!name ) {
    return res.status(400).json(
      new ApiResponse(400, { message: "All fields are required" })
    );
    }
    
    project.name = name || project.name;
    project.description = description || project.description;
    await project.save();
  
   res.status(200).json(new ApiResponse(200, { project, message: 'Project updated successfully' }));
});

const deleteProject = asyncHandler(async (req, res) => {
  // delete project
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json(
      new ApiResponse(404, { message: "Project not found" })
    );
  }
  
 
  await ProjectMember.deleteMany({ project: projectId });
  await Project.deleteOne({ _id: projectId });
  
  return res.status(200).json(
    new ApiResponse(200,{message: "Project deleted successfully"})
  )
  
});

const getProjectMembers = asyncHandler(async (req, res) => {

  // get project members
  const { projectId } = req.params;
  const members = await ProjectMember.find({project : projectId}).populate('user','-password')
    
  res.status(200).json(
    new ApiResponse(200,{members,message : "Project members fetched successfully"})
  )
   
});

const addMemberToProject = asyncHandler( async (req, res) => {
  // add member to project
  
  const { userId , projectId, role} =req.body;
   if (!userId || !projectId ) {
    return res.status(400).json(
      new ApiResponse(400, { message: "All fields are required" })
    );
    }
  const existing = await ProjectMember.findOne({user:userId , project:projectId});
  if(existing){
    return res.status(404).json(
        new ApiResponse(404,{message: "User is already a member of the project "})
    )
  }
  const member = await ProjectMember.create({user: userId, project: projectId, role})
  res.status(200).json(
    new ApiResponse(200,{member,message:"Member added successfully"})
  )
});

const deleteMember = asyncHandler(async (req, res) => {
  // delete member from project
  const { userId , projectId } = req.body;
    if (!userId || !projectId ) {
    return res.status(400).json(
      new ApiResponse(400, { message: "All fields are required" })
    );
    }
  await ProjectMember.deleteOne({user:userId , project:projectId});
  res.status(200).json(
    new ApiResponse(200,{message:"Member deleted successfully"})
  )
 });

const updateMemberRole =asyncHandler( async (req, res) => {
  // update member role
  const { userId ,projectId, role}=req.body;
    if (!userId || !projectId ) {
    return res.status(400).json(
      new ApiResponse(400, { message: "All fields are required" })
    );
    }
  const member = await ProjectMember.findOne({user:userId, project:projectId});
  if(!member)
    return res.status(404).json(
      new ApiResponse(404,{message: "Member not found"})
    )
  member.role=role 
  await member.save();
  res.status(200).json(
    new ApiResponse(200,{message:"member role updated successfully"})
  )
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
