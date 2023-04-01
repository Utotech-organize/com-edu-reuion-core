import jwt, { SignOptions } from "jsonwebtoken";
import config from "config";
import { NextFunction, Response } from "express";

export const signJwt = (payload: Object) => {
  var privateKey = Buffer.from(
    config.get<string>("accessTokenPrivateKey"),
    "base64"
  ).toString("utf-8");

  const signInOptions: jwt.SignOptions = {
    algorithm: "RS256",
    expiresIn: "24h",
  };

  return jwt.sign(payload, privateKey, signInOptions);
};

export const verifyJwt = (req: any, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers["authorization"] as string;

  if (!bearerHeader) {
    return res.status(401).send("require Token");
  }

  const splitAuthHeader = bearerHeader.split(" ");
  const token = splitAuthHeader[1];

  var publicKey = Buffer.from(
    config.get<string>("accessTokenPublicKey"),
    "base64"
  ).toString("utf-8");

  try {
    const decoded = jwt.verify(token, publicKey);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  next();
};
