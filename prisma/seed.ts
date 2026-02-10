import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const wali = await prisma.teacher.create({
    data: { name: "Muhammad Yunus Almeida" },
  });

  const kelas1A = await prisma.classRoom.create({
    data: {
      name: "Kelas 1 A",
      academicYear: "2024/2025",
      semester: "Ganjil",
      waliKelasId: wali.id,
    },
  });

  await prisma.student.createMany({
    data: [
      { nis: "9522222", name: "Indah Yolanda", classId: kelas1A.id },
      { nis: "4432268", name: "Cakrabuna Dono", classId: kelas1A.id },
      { nis: "1866741", name: "Samiah Mandasari", classId: kelas1A.id },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
