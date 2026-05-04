import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../repositories/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const registerUser = async (username, email, password) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw { status: 409, message: "Email already exists" };
    }
    throw { status: 409, message: "Username already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: "user",
    },
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw { status: 404, message: "User account does not exist" };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw { status: 401, message: "Invalid or expired token" };
  }
};