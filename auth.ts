import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET_KEY: Secret | undefined = process.env.SECRET_KEY?.toString();

if (SECRET_KEY === undefined) {
  //You want this to crash the app
  throw new Error('Secret Key Undefined');
}

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export function generateToken(email: string) {
  //This "Username" is the payload and could contain anything you can make a string (Like a json with a bunch of data in it)
  return jwt.sign({email: email}, SECRET_KEY!, { expiresIn: '1800s' });
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, SECRET_KEY!);
    (req as CustomRequest).token = decoded;

    next();
  } catch (err) {
    res.status(401).send('Please authenticate');
  }
};
