
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
}

export interface User {
  id?: string;
  username: string;
  email:    string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
