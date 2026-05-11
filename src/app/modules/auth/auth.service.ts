import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import AppError from '../../../errors/AppError';
import generateOTP from '../../../utils/generateOTP';
import cryptoToken from '../../../utils/cryptoToken';
import { verifyToken } from '../../../utils/verifyToken';
import { createToken } from '../../../utils/createToken';

const buildAuthQuery = (payload: { email?: string; phone?: string }) => {
  if (payload.email) return { email: payload.email };
  if (payload.phone) return { phone: payload.phone };
  return {};
};

const loginUserFromDB = async (payload: ILoginData) => {
  const { email, phone, password } = payload;

  if (!password) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required!');
  }

  if (!email && !phone) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email or phone is required!');
  }

  const query = buildAuthQuery({ email, phone });
  const isExistUser = await User.findOne(query).select('+password');

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser.verified) {
    const otp = generateOTP(6);
    const template = emailTemplate.resetPassword({
      otp,
      email: isExistUser.email,
    });
    await emailHelper.sendEmail(template);

    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    await User.findOneAndUpdate(query, { $set: { authentication } });

    throw new AppError(
      StatusCodes.CONFLICT,
      'Please verify your account, then try to login again'
    );
  }

  if (isExistUser.status === 'blocked') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You do not have permission to access this content. Your account has been blocked.'
    );
  }

  if (!(await User.isMatchPassword(password, isExistUser.password))) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  const jwtData = {
    id: isExistUser._id,
    role: isExistUser.role,
    email: isExistUser.email,
    name: isExistUser.name,
  };

  const accessToken = jwtHelper.createToken(
    jwtData,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );
  const refreshToken = jwtHelper.createToken(
    jwtData,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as string
  );

  return { accessToken, refreshToken };
};

const signupUserToDB = async (payload: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}) => {
  const { name, email, phone, password } = payload;

  if (!email && !phone) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email or phone is required!');
  }

  const query = buildAuthQuery({ email, phone });
  const existing = await User.findOne(query);

  if (existing && existing.verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'User already exists. Please login.'
    );
  }

  const otp = generateOTP(4);

  if (existing && !existing.verified) {
    if (existing.email) {
      await emailHelper.sendEmail(
        emailTemplate.createAccount({
          name: existing.name,
          otp,
          email: existing.email,
        } as any)
      );
    }

    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 5 * 60000),
    };
    await User.findOneAndUpdate(query, { $set: { authentication } });

    const signupToken = jwtHelper.createToken(
      { email: existing.email || phone },
      config.jwt.jwt_secret as Secret,
      '10m'
    );

    return { otp, signupToken };
  }

  const userPayload: Record<string, unknown> = { name, password };
  if (email) userPayload.email = email;
  if (phone) userPayload.phone = phone;

  await User.create(userPayload);

  if (email) {
    await emailHelper.sendEmail(
      emailTemplate.createAccount({
        name,
        otp,
        email,
      } as any)
    );
  }

  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60000),
  };
  await User.findOneAndUpdate(query, { $set: { authentication } });

  const signupToken = jwtHelper.createToken(
    { email, phone },
    config.jwt.jwt_secret as Secret,
    '10m'
  );

  return { otp, signupToken };
};

const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const otp = generateOTP(4);
  const forgetPassword = emailTemplate.resetPassword({
    otp,
    email: isExistUser.email,
  });
  await emailHelper.sendEmail(forgetPassword);

  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });

  const otpToken = jwtHelper.createToken(
    { email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    '10m'
  );

  return { otp, otpToken };
};

const resendOtpFromDb = async (
  emailOrToken: string,
  isToken: boolean = false
) => {
  let email = emailOrToken;

  if (isToken) {
    try {
      const decoded = jwtHelper.verifyToken(
        emailOrToken,
        config.jwt.jwt_secret as Secret
      ) as JwtPayload & { email: string };
      email = decoded.email;
    } catch {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'Invalid or expired signup token'
      );
    }
  }

  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const otp = generateOTP(4);
  const createAccountTemplate = emailTemplate.createAccount({
    name: isExistUser.name,
    otp,
    email: isExistUser.email!,
  } as any);
  await emailHelper.sendEmail(createAccountTemplate);

  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60000),
  };
  await User.findOneAndUpdate(
    { email: isExistUser.email },
    { $set: { authentication } }
  );

  const otpToken = jwtHelper.createToken(
    { email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    '10m'
  );

  return { otp, otpToken };
};

const forgetPasswordByUrlToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.status === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked!');
  }

  const jwtPayload = {
    id: isExistUser.email,
    email: isExistUser.email,
    role: isExistUser.role,
  };
  const resetToken = createToken(
    jwtPayload,
    config.jwt.jwt_secret as string,
    config.reset_pass_expire_time as string
  );

  const resetUrl = `${config.frontend_url}/auth/login/set_password?email=${isExistUser.email}&token=${resetToken}`;

  const forgetPasswordEmail = emailTemplate.resetPasswordByUrl({
    email: isExistUser.email,
    resetUrl,
  });

  await emailHelper.sendEmail(forgetPasswordEmail);
};

const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select('+authentication');

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code'
    );
  }

  const dbOtp = String(isExistUser.authentication?.oneTimeCode);
  const requestOtp = String(oneTimeCode);

  if (dbOtp !== requestOtp) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const expireAt = isExistUser.authentication?.expireAt;
  if (!expireAt) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again'
    );
  }

  const date = new Date();
  if (date > expireAt) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again'
    );
  }

  let message;
  let verifyToken;
  let accessToken;
  let user;

  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } }
    );
    message =
      'OTP verified successfully. now you can login by your user mail and password.';
    user = await User.findById(isExistUser._id);
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      }
    );

    const createTokenValue = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createTokenValue,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
      'OTP verified successfully. Use the reset token to reset your password.';
    verifyToken = createTokenValue;
  }

  return { verifyToken, message, accessToken, user };
};

const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication'
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    { _id: isExistToken.user },
    { password: hashPassword, authentication: { isResetPassword: false } },
    { new: true }
  );
};

const resetPasswordByUrl = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  let decodedToken;
  try {
    decodedToken = await verifyToken(token, config.jwt.jwt_secret as Secret);
  } catch {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token.');
  }

  const { id } = decodedToken;
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User not found.');
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password don't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findByIdAndUpdate(
    id,
    { password: hashPassword, authentication: { isResetPassword: false } },
    { new: true, runValidators: true }
  );

  return {
    message:
      'Password reset successful. You can now log in with your new password.',
  };
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const result = await User.findByIdAndUpdate(
    user.id,
    { password: hashPassword },
    { new: true }
  );

  return result;
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Token not found');
  }

  const decoded = verifyToken(
    token,
    config.jwt.jwt_refresh_secret as Secret
  ) as JwtPayload & { id: string };

  const activeUser = await User.findById(decoded.id);
  if (!activeUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (activeUser.status !== 'active') {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is inactive');
  }
  if (!activeUser.verified) {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is not verified');
  }
  if (activeUser.isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is deleted');
  }

  const jwtPayload = {
    id: activeUser._id?.toString() as string,
    role: activeUser.role,
    email: activeUser.email,
  };

  const accessToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { accessToken };
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  signupUserToDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  forgetPasswordByUrlToDB,
  resetPasswordByUrl,
  resendOtpFromDb,
  refreshToken,
};
