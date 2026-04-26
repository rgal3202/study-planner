import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";

const router = Router();

router.post("/", authenticate, createAssignment);
router.get("/", authenticate, getAssignments);
router.get("/:id", authenticate, getAssignment);
router.put("/:id", authenticate, updateAssignment);
router.delete("/:id", authenticate, deleteAssignment);

export default router;