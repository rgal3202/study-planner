import prisma from "../repositories/prisma.js";

export const createCourse = async (req, res, next) => {
  try {
    const { title, code, semester, instructor } = req.body;
    const userId = req.user.userId;

    if (!title || !code || !semester || !instructor) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        code,
        semester,
        instructor,
        userId,
      },
    });

    res.status(201).json({
      id: course.id,
      user_id: course.userId,
      title: course.title,
      code: course.code,
      semester: course.semester,
      instructor: course.instructor,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const courses = await prisma.course.findMany({
      where: { userId },
    });

    res.status(200).json(
      courses.map((course) => ({
        id: course.id,
        user_id: course.userId,
        title: course.title,
        code: course.code,
        semester: course.semester,
        instructor: course.instructor,
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID must be a positive integer" });
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this course" });
    }

    res.status(200).json({
      id: course.id,
      user_id: course.userId,
      title: course.title,
      code: course.code,
      semester: course.semester,
      instructor: course.instructor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;
    const { title, code, semester, instructor } = req.body;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (!title || !code || !semester || !instructor) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (existingCourse.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this course" });
    }

    const course = await prisma.course.update({
      where: { id },
      data: { title, code, semester, instructor },
    });

    res.status(200).json({
      id: course.id,
      user_id: course.userId,
      title: course.title,
      code: course.code,
      semester: course.semester,
      instructor: course.instructor,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (existingCourse.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this course" });
    }

    await prisma.course.delete({
      where: { id },
    });

    res.status(200).json({
      id: existingCourse.id,
      title: existingCourse.title,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};