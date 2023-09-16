import { Request, Response } from "express";

export function staticFile(path: string): (req: Request, res: Response) => void {
  return async (_req: Request, res: Response) => {
    res.sendFile(path);
  };
}
