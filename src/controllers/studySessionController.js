import prisma from "../repositories/prisma.js";

export const createStudySession = async (req, res, next) => {
  try {
    const { courseId, sessionDate, duration, topic, notes } = req.body;
    const userId = req.user.userId;

    if (!courseId || !sessionDate || !duration || !topic) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (duration <= 0) {
      return res.status(400).json({ message: "Duration must be greater than 0" });
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

    const sessionDateObj = new Date(sessionDate);
    if (isNaN(sessionDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid session date format" });
    }

    const studySession = await prisma.studySession.create({
      data: {
        courseId: parseInt(courseId),
        sessionDate: sessionDateObj,
        duration: parseInt(duration),
        topic,
        notes: notes || "",
      },
    });

    res.status(201).json({
      id: studySession.id,
      course_id: studySession.courseId,
      session_date: studySession.sessionDate.toISOString(),
      duration_minutes: studySession.duration,
      topic: studySession.topic,
      notes: studySession.notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudySessions = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const studySessions = await prisma.studySession.findMany({
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
      studySessions.map((session) => ({
        id: session.id,
        course_id: session.courseId,
        session_date: session.sessionDate.toISOString(),
        duration_minutes: session.duration,
        topic: session.topic,
        notes: session.notes,
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const getStudySession = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID must be a positive integer" });
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!studySession) {
      return res.status(404).json({ message: "Study session not found" });
    }

    if (studySession.course.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this study session" });
    }

    res.status(200).json({
      id: studySession.id,
      course_id: studySession.courseId,
      session_date: studySession.sessionDate.toISOString(),
      duration_minutes: studySession.duration,
      topic: studySession.topic,
      notes: studySession.notes,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudySession = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;
    const { sessionDate, duration, topic, notes } = req.body;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingSession = await prisma.studySession.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!existingSession) {
      return res.status(404).json({ message: "Study session not found" });
    }

    if (existingSession.course.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this study session" });
    }

    const updateData = {};
    if (sessionDate) {
      const sessionDateObj = new Date(sessionDate);
      if (isNaN(sessionDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid session date format" });
      }
      updateData.sessionDate = sessionDateObj;
    }
    if (duration) {
      if (duration <= 0) {
        return res.status(400).json({ message: "Duration must be greater than 0" });
      }
      updateData.duration = parseInt(duration);
    }
    if (topic) updateData.topic = topic;
    if (notes !== undefined) updateData.notes = notes;

    const studySession = await prisma.studySession.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      id: studySession.id,
      course_id: studySession.courseId,
      session_date: studySession.sessionDate.toISOString(),
      duration_minutes: studySession.duration,
      topic: studySession.topic,
      notes: studySession.notes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudySession = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingSession = await prisma.studySession.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!existingSession) {
      return res.status(404).json({ message: "Study session not found" });
    }

    if (existingSession.course.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this study session" });
    }

    await prisma.studySession.delete({
      where: { id },
    });

    res.status(200).json({
      id: existingSession.id,
      topic: existingSession.topic,
      message: "Study session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};