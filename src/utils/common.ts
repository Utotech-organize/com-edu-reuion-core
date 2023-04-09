import { Response } from "express";
import multer from "multer";

export const statusAvailable = "available";
export const statusPending = "pending";
export const statusUnAvailable = "unavailable";
export const statusPaid = "paid";
export const statusUnPaid = "unpaid";
export const statusComplete = "complete";
export const channelDashboard = "dashboard";
export const channelLine = "line";

export const chairPrice = 350;
export const tablePrice = 3200;

export const responseErrors = (
  res: Response,
  status: number,
  message: any,
  err: any
) => {
  return res.status(status).json({
    status: "error",
    message: message,
    error: err,
  });
};

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function removeValue(value: any, index: any, arr: any) {
  // If the value at the current array index matches the specified value (2)
  if (value) {
    // Removes the value from the original array
    arr.splice(index, 0);
    return true;
  }
  return false;
}

export const storage = multer.memoryStorage();
export const uploadFilter = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});
