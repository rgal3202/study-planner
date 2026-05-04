import prisma from "../repositories/prisma.js";

export const createAssignment = async (req, res, next) => {
  try {
    const { courseId, title, description, dueDate, status, priority } = req.body;
    const userId = req.user.userId;

    if (!courseId || !title || !dueDate || !status || !priority) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: Course does not belong to the user" });
    }

    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid due date format" });
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: parseInt(courseId),
        title,
        description: description || "",
        dueDate: dueDateObj,
        status,
        priority,
      },
    });

    res.status(201).json({
      id: assignment.id,
      course_id: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.dueDate.toISOString(),
      status: assignment.status,
      priority: assignment.priority,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          userId,
        },
      },
      include: {
        course: true,
      },
    });

    res.status(200).json(
      assignments.map((assignment) => ({
        id: assignment.id,
        course_id: assignment.courseId,
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.dueDate.toISOString(),
        status: assignment.status,
        priority: assignment.priority,
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID must be a positive integer" });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.course.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this assignment" });
    }

    res.status(200).json({
      id: assignment.id,
      course_id: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.dueDate.toISOString(),
      status: assignment.status,
      priority: assignment.priority,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;
    const { title, description, dueDate, status, priority } = req.body;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!existingAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (existingAssignment.course.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this assignment" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid due date format" });
      }
      updateData.dueDate = dueDateObj;
    }
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      id: assignment.id,
      course_id: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.dueDate.toISOString(),
      status: assignment.status,
      priority: assignment.priority,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!existingAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (existingAssignment.course.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this assignment" });
    }

    await prisma.assignment.delete({
      where: { id },
    });

    res.status(200).json({
      id: existingAssignment.id,
      title: existingAssignment.title,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};