import { verifyToken } from "../services/authService.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export const authorizeOwner = (resourceType) => {
  return async (req, res, next) => {
    const userId = req.user.userId;
    const resourceId = parseInt(req.params.id);

    if (isNaN(resourceId) || resourceId <= 0) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    try {
      const prisma = (await import("../repositories/prisma.js")).default;

      let ownerId;
      switch (resourceType) {
        case "course":
          const course = await prisma.course.findUnique({
            where: { id: resourceId },
          });
          if (!course) {
            return res.status(404).json({ message: "Course not found" });
          }
          ownerId = course.userId;
          break;
        case "assignment":
          const assignment = await prisma.assignment.findUnique({
            where: { id: resourceId },
            include: { course: true },
          });
          if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
          }
          ownerId = assignment.course.userId;
          break;
        case "studySession":
          const studySession = await prisma.studySession.findUnique({
            where: { id: resourceId },
            include: { course: true },
          });
          if (!studySession) {
            return res.status(404).json({ message: "Study session not found" });
          }
          ownerId = studySession.course.userId;
          break;
        default:
          return res.status(500).json({ message: "Invalid resource type" });
      }

      if (ownerId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this resource" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};