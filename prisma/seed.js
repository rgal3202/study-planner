import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash("User123!", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      username: "student",
      email: "user@example.com",
      password: userPassword,
      role: "user",
    },
  });
  console.log("Created regular user:", user.email);

  // Create courses for admin
  const adminCourse1 = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Application Development",
      code: "ITIS 4166",
      semester: "Spring 2026",
      instructor: "Dr. Lijuan",
      userId: admin.id,
    },
  });
  console.log("Created course for admin:", adminCourse1.title);

  const adminCourse2 = await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Computer Networks",
      code: "ITCS 3156",
      semester: "Spring 2026",
      instructor: "Prof. Johnson",
      userId: admin.id,
    },
  });
  console.log("Created course for admin:", adminCourse2.title);

  // Create courses for regular user
  const userCourse1 = await prisma.course.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: "English Literature",
      code: "ENG 3242",
      semester: "Spring 2026",
      instructor: "Dr. Smith",
      userId: user.id,
    },
  });
  console.log("Created course for user:", userCourse1.title);

  // Create assignments for admin's courses
  await prisma.assignment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Project Proposal",
      description: "Submit a detailed project proposal for the final app",
      dueDate: new Date("2026-04-15T23:59:00Z"),
      status: "In Progress",
      priority: "High",
      courseId: adminCourse1.id,
    },
  });
  console.log("Created assignment for admin course");

  await prisma.assignment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Network Analysis Report",
      description: "Write a report on network topology analysis",
      dueDate: new Date("2026-04-20T23:59:00Z"),
      status: "Not Started",
      priority: "Medium",
      courseId: adminCourse2.id,
    },
  });
  console.log("Created assignment for admin course");

  // Create assignments for regular user's courses
  await prisma.assignment.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: "Essay on Shakespeare",
      description: "Write a 5-page essay analyzing Shakespeare's themes",
      dueDate: new Date("2026-04-10T23:59:00Z"),
      status: "Not Started",
      priority: "High",
      courseId: userCourse1.id,
    },
  });
  console.log("Created assignment for user course");

  // Create study sessions for admin
  await prisma.studySession.upsert({
    where: { id: 1 },
    update: {},
    create: {
      sessionDate: new Date("2026-04-05T14:00:00Z"),
      duration: 120,
      topic: "React Components",
      notes: "Review React hooks and state management",
      courseId: adminCourse1.id,
    },
  });
  console.log("Created study session for admin");

  await prisma.studySession.upsert({
    where: { id: 2 },
    update: {},
    create: {
      sessionDate: new Date("2026-04-07T10:00:00Z"),
      duration: 90,
      topic: "OSI Model",
      notes: "Study the 7 layers of the OSI model",
      courseId: adminCourse2.id,
    },
  });
  console.log("Created study session for admin");

  // Create study sessions for regular user
  await prisma.studySession.upsert({
    where: { id: 3 },
    update: {},
    create: {
      sessionDate: new Date("2026-04-06T16:00:00Z"),
      duration: 60,
      topic: "Shakespeare Plays",
      notes: "Review Hamlet and Macbeth",
      courseId: userCourse1.id,
    },
  });
  console.log("Created study session for user");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });