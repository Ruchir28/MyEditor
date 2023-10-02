import { $Enums, PrismaClient } from "@prisma/client";
import {
  RegisterUserRequest,
  RegisterUserResponse,
  RequestStatus,
  LoginUserRequest,
  LoginUserResponse,
} from "@ruchir28/common";

import bcrypt from "bcrypt";
import express from "express";
import jwt from 'jsonwebtoken';
import {primsaClient} from '../Utils/prismaClient'
import { Request } from 'express';
import { log } from "../Utils/Utils";



export async function registerUser(
  req: express.Request,
  res: express.Response
) {
  try {
    const request: RegisterUserRequest = req.body;
    const encrytped_password = bcrypt.hashSync(request.password, 10);
    const userCreationResponse = await primsaClient.user.create({
      data: {
        email: request.email,
        encrytped_password: encrytped_password,
        name: request.username,
      },
    });
    return res.status(200).json({
      status: RequestStatus.SUCCESS,
      userId: userCreationResponse.id,
      message: "User created successfully",
    });
  } catch (error) {
    const registerUserResponse: RegisterUserResponse = {
      status: RequestStatus.FAILURE,
      message: getErrorMessage(error),
    };
    return res.status(400).json(registerUserResponse);
  }
}

export async function loginUser(req: express.Request, res: express.Response) {
  try {
    const request: LoginUserRequest = req.body;
    const user = await primsaClient.user.findUnique({
      where: {
        email: request.email,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const passwordCheck = bcrypt.compareSync(
      request.password,
      user.encrytped_password
    );

    if (!passwordCheck) {
      throw new Error("Incorrect Email Or Password");
    }

    const token = jwt.sign({
        userId: user.id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
    },process.env.JWT_SECRET as string);

    const loginUserResponse: LoginUserResponse = {
      status: RequestStatus.SUCCESS,
      message: "Login Successful",
      userId: user.id,
      jwtToken: token,
    };
    res.cookie('jwtToken', token, {
      httpOnly: false,    // prevents the cookie from being accessed by client-side JavaScript
      // TEMPORARILY FALSE FOR DEV
      domain: "localhost",
      path: "/",
      sameSite: "lax",
      maxAge: 3600000
    });

    return res.status(200).json(loginUserResponse);
  } catch (error: unknown) {
    const loginUserResponse: LoginUserResponse = {
      status: RequestStatus.FAILURE,
      message: getErrorMessage(error),
    };
    return res.status(400).json(loginUserResponse);
  }
}

export async function verifyUserMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  // checks for bearer token in the request header
  const bearerToken = req.headers.authorization || ("Bearer " + req.cookies.jwtToken);
  if(!bearerToken){
    return res.status(401).json({
      status: RequestStatus.FAILURE,
      message: "Unauthorized"
    })
  }
  const token = bearerToken.split(" ")[1];
  try{ 
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    if(typeof decodedToken === 'string'){
      throw new Error("Invalid Token");
    }
    const user = await primsaClient.user.findUnique({
      where: {
        id: decodedToken.userId
      }
    });
    if(!user){
      throw new Error("Invalid Token");
    }
    req.user = {
      id: user.id,
      email: user.email,
    };
    next(); 
  }catch(error){
    return res.status(401).json({
      status: RequestStatus.FAILURE,
      message: "Unauthorized"
    })
   }

}

export async function checkAuthStatus(req: express.Request, res: express.Response) {
  return res.status(200).json({
    status: RequestStatus.SUCCESS,
    message: "Protected Route",
    user: req.user
  });
}

function getErrorMessage(error: unknown) {
    if(error instanceof Error){
        return error.message
    }
    return "UnExpected Error Occured";
}