import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createStudySession,
  getStudySessions,
  getStudySession,
  updateStudySession,
  deleteStudySession,
} from "../controllers/studySessionController.js";

const router = Router();

router.post("/", authenticate, createStudySession);
router.get("/", authenticate, getStudySessions);
router.get("/:id", authenticate, getStudySession);
router.put("/:id", authenticate, updateStudySession);
router.delete("/:id", authenticate, deleteStudySession);

export default router;