import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const router = Router();

router.post("/", authenticate, createCourse);
router.get("/", authenticate, getCourses);
router.get("/:id", authenticate, getCourse);
router.put("/:id", authenticate, updateCourse);
router.delete("/:id", authenticate, deleteCourse);

export default router;