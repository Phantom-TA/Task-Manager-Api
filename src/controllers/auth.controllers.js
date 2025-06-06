import {asyncHandler} from '../utils/async-handler.js'
import User from '../models/user.models.js'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { ApiResponse } from '../utils/api-response.js'




const registerUser = asyncHandler(async (req,res) => {
    const { email , username , password }=req.body
    if(!email || !username || !password )
    return res.status(400).json(
            new ApiResponse(400,{message: 'Please provide all required fields'})
    )
    


        const existingUser =await User.findOne({email})
        if(existingUser) {
            return res.status(400).json(
                new ApiResponse(400,{message: 'User already exists'})
            )
        }

        const user = await User.create({
            username,
            email,
            password,
            
        })
        if(!user) {
            return res.status(400).json(
                new ApiResponse(400,{
                message: 'User registration failed'}
                )
            )
        }

        const token = crypto.randomBytes(32).toString('hex')
        
        user.emailVerificationToken = token
        user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours


        await user.save()

        const transporter = nodemailer.createTransport({
           host : process.env.EMAIL_HOST,
           port : process.env.EMAIL_PORT,
           secure:false,
           auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
           }
        });

        const mailOption ={
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking on the following link:
               ${process.env.BASE_URL}/api/v1/users/verify-email/${token}`
        }

        await transporter.sendMail(mailOption)
           res.status(201).json(
               new ApiResponse(201,{message:"User registered successfully. Please check your email to verify your account."})
           );

       
        
 
    //validation
   
})
const loginUser = asyncHandler(async (req,res) => {
    const { email , password}=req.body
    if(!email || !password)
    return res.status(400).json({message: 'Please provide all required fields'})

     const user= await User.findOne({email})
     if(!user) {
        return res.status(400).json({message: 'User not found'})
     }
     const isPasswordCorrect = await user.isPasswordCorrect(password)
     if(!isPasswordCorrect) {
        return res.status(400).json({message: 'Invalid credentials'})
     }

     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()
      
       user.refreshToken = refreshToken

      await user.save()

       res.cookie('accessToken', accessToken, {httpOnly:true,secure:true,maxAge: 60 * 60 * 1000}) // 1 hour
    
       res.cookie('refreshToken', refreshToken, {httpOnly:true,secure:true,maxAge: 60 * 60 * 24 * 7 * 1000}) // 7 days
       res.status(200).json({
           message: 'User logged in successfully',
           success: true,
           user: {
               id: user._id,
               email: user.email,
               username: user.username,
               role: user.role
           }
       })
          

  

    //validation
})
const logoutUser = asyncHandler(async (req,res) => {
    
    
   
        const user = await User.findById(req.user._id)
        if(user) {
            user.refreshToken = null
            await user.save()
        }
     res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'Strict' });
     res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'Strict' });
     
     res.status(200).json(
            new ApiResponse(200,{message: 'User logged out successfully'})
        )
   
   
    //validation
})
const verifyEmail = asyncHandler(async (req,res) => {
    
    const { token } = req.params;
    if(!token) {
        return res.status(400).json(
            new ApiResponse(400,{message: 'Invalid token'})
        )
    }
    const user = await User.findOne({ emailVerificationToken: token, emailVerificationExpiry: { $gt: Date.now() } });
    if (!user) {
        return res.status(400).json(
            new ApiResponse(400,{message: 'Invalid or expired token'})
        );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();
    res.status(200).json(
        new ApiResponse(200,{message: 'Email verified successfully'})
    );
    //validation
})
const resendVerificationEmail = asyncHandler(async (req,res) => {
    const { email }=req.body
    if(!email) {
        return res.status(400).json(
            new ApiResponse(400,{message: 'Please provide email'})
        )
    }
   
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json(
            new ApiResponse(400,{message: 'User not found'})
        );
    }
    if (user.isEmailVerified) {
        return res.status(400).json(
            new ApiResponse(400,{message: 'Email already verified'})
        );
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = token;
    user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();
    
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOption = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking on the following link:
               ${process.env.BASE_URL}/api/v1/users/verify/${token}`
    };
    await transporter.sendMail(mailOption);
    res.status(200).json(
        new ApiResponse(200,{message: 'Verification email sent successfully'})
    );
   

    
    //validation
})
const refreshAccessToken = asyncHandler(async (req,res) => {
    const { refreshToken } = req.cookies;
    if(!refreshToken){
        return res.status(401).json(
            new ApiResponse(401,{message: 'No refresh token provided'})
        );
    }
    try{
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id)
    if(!user || user.refreshToken !== refreshToken) {
        return res.status(401).json(
            new ApiResponse(401,{message: 'Invalid refresh token'})
        );
    }
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('accessToken', newAccessToken, { ...cookieOptions, maxAge: 60 * 60 * 1000 }); // 1 hour
    res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 * 1000 }); // 7 days
    res.status(200).json(
        new ApiResponse(200,{message: 'Access token refreshed successfully'})
    );
}
catch (error) {
    return res.status(400).json(
        new ApiResponse(400,{message: 'Failed to refresh access token'}, error.message)
    );  
}




    

    //validation
})
const forgotPasswordRequest = asyncHandler(async (req,res) => {
    const { email }=req.body
    if(!email) {
        return res.status(400).json(
            new ApiResponse(400,{message: 'Please provide email'})
        )
    }
    
        const user = await User.findOne({ email});
        if(!user){
            return res.status(400).json(
                new ApiResponse(400,{message: 'User not found'})
            )
        }
        const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken();
        user.forgotPasswordToken=hashedToken;
        user.forgotPasswordExpiry = tokenExpiry;
        await user.save();

     

        const resetUrl = `${process.env.BASE_URL}/api/v1/users/reset-password/${unHashedToken}`;

         const mailGenContent = forgotPasswordMailGenContent(user.username, resetUrl);

          const mailResult= await sendMail({
             email: user.email,
             subject: 'Password Reset Request',
             mailgenContent: mailGenContent
         });
         if (mailResult.success) {
           return res.status(200).json({ message: "Password reset link sent to your email", success: true });
            } else {
           return res.status(500).json({ message: "Failed to send email", error: mailResult.error, success: false });
             }


   

    //validation
})
const resetPassword = asyncHandler(async(req,res) => { 
        const {token} = req.params;
        const {newPassword} = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
             const user = await User.findOne({
            forgotPasswordtoken : hashedToken,
            forgotPasswordExpiry: { $gt:Date.now() }
        })

        if(!user) {
            return res.status(400).json(
                new ApiResponse(400,{message: 'Invalid or expired token'})
            );
        }
        if(!newPassword || newPassword.length < 6) {
            return res.status(400).json(
                new ApiResponse(400,{message: 'Please provide a valid new password'})
            );
        }
        user.password  = newPassword;
        user.forgotPasswordToken=undefined;
        user.forgotPasswordExpiry=undefined;
        await user.save();
        res.status(200).json(
            new ApiResponse(200,{message: 'Password reset successfully'})
        );
    
   
})
const changeCurrentPassword = asyncHandler(async (req,res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json(
            new ApiResponse(400,{message: 'Please provide current and new password'})
        );
    }
    
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json(
                new ApiResponse(404,{message:'User not found'})

            )

        }
        const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
        if(!isPasswordCorrect) {
            return res.status(400).json(
                new ApiResponse(400,{message: 'Current password is incorrect'})
            );
        }
        user.password=newPassword;

        await user.save();
        res.status(200).json(
            new ApiResponse(200,{message: 'Password changed successfully'})
        );
   



    //validation
})
const getCurrentUser = asyncHandler(async (req,res) => {
    const user = req.user;
    if(!user) {
        return res.status(404).json(
            new ApiResponse(404,{message: 'User not authenticated'})

        );
    }
    res.status(200).json(
        new ApiResponse(200,{
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
            ,
            message: 'Current user retrieved successfully'
        })
    );


    //validation
})
export { registerUser,loginUser,logoutUser ,verifyEmail, resendVerificationEmail,refreshAccessToken,forgotPasswordRequest,resetPassword,changeCurrentPassword,getCurrentUser };