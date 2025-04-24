import { PrismaClient, UserRole, FileType, ProcessingStatus, DetectionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Insert a new User
    const newUser = await prisma.user.create({
      data: {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'hashed_password_here', // Make sure to hash passwords in production
        role: UserRole.USER,
      },
    });
    console.log('Created new user:', newUser);

    // 2. Insert a new UploadsHistory
    const newUpload = await prisma.uploadsHistory.create({
      data: {
        userId: newUser.id,
        fileType: FileType.VIDEO,
        processingStatus: ProcessingStatus.PENDING,
        fileSize: 1024000, // 1MB in bytes
        duration: 120.5, // 2 minutes and 0.5 seconds
        annotatedFilePath: '/path/to/annotated/video.mp4',
      },
    });
    console.log('Created new upload:', newUpload);

    // 3. Insert a new DetectionResult
    const newDetection = await prisma.detectionResult.create({
      data: {
        uploadId: newUpload.id,
        timestamp: 45.5, // 45.5 seconds into the video
        confidence: 0.95,
        label: 'weapon',
        severity: 0.8,
      },
    });
    console.log('Created new detection result:', newDetection);

    // 4. Insert/Update UserUploadStats
    const newUserStats = await prisma.userUploadStats.upsert({
      where: {
        userId: newUser.id,
      },
      update: {
        totalUploads: {
          increment: 1,
        },
        averageDuration: {
          set: 120.5, // This should be calculated based on all uploads
        },
        lastDetectionStatus: DetectionStatus.VIOLENCE_DETECTED,
        lastUploadDate: new Date(),
      },
      create: {
        userId: newUser.id,
        totalUploads: 1,
        averageDuration: 120.5,
        lastDetectionStatus: DetectionStatus.VIOLENCE_DETECTED,
        lastUploadDate: new Date(),
      },
    });
    console.log('Created/Updated user stats:', newUserStats);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 