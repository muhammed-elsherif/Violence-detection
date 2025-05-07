
export interface IUser {
  id: string;
  userId: string;
  totalUploads: number;
  averageDuration: number;
  lastDetectionStatus: string;
  lastUploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  isActive: true;
}

export interface User {
  username: string;
  email:    string;
}
