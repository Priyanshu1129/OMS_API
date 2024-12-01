import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { createUserWithRole, authenticateUser } from "../services/authServices.js";


export const signUp = catchAsyncError(async (req, res, next, session) => {
  const { email, password, role, devKey, name } = req.body;

  const { newUser, token } = await createUserWithRole(
    { email, password, role, devKey, name },
    session
  );

  // res.cookie("token", token, {
  //   httpOnly: true,
  //   sameSite: 'None',
  //   secure: process.env.NODE_ENV === "production",
  //   maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
  // });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    // data: {user: newUser}
  });
}, true);


export const login = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authenticateUser({ email, password });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: 'None',
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      }
    }
  });
});
