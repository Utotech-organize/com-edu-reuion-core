import { Response } from "express";

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
    arr.splice(index, 1);
    return true;
  }
  return false;
}
