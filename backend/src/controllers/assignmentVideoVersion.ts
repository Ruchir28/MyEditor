import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  AddVideoVersionToAssignmentRequest,
  RequestStatus,
  AddCommentToVideoVersion,
  AddVideoVersionToAssignmentResponse,
} from "@ruchir28/common";
import {primsaClient} from '../Utils/prismaClient'

export async function addVideoVersionToAssignment(
  req: express.Request,
  res: express.Response
) {
  try {
    const request: AddVideoVersionToAssignmentRequest = req.body;
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const assignment = await primsaClient.assignment.findUnique({
      where: {
        id: request.assignmentId,
      },
    });
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    if (
      assignment.reporterId !== user.id &&
      assignment.assigneeId !== user.id
    ) {
      return res.status(401).json({
        status: RequestStatus.FAILURE,
        message: "User not authorized to add video version to this assignment",
      });
    }
    //TODO: Check if video is owned by person who is adding video version
    let video = await primsaClient.video.findUnique({
      where: {
        id: request.videoId,
      },
    });
    if (!video) {
      throw new Error("Video not found");
    }
    if(video?.ownerId !== user.id) {
      return res.status(401).json({
        status: RequestStatus.FAILURE,
        message: "User not authorized to add video version to this assignment",
      });
    }

    const videoVersion = await primsaClient.assignmentVideoVersion.create({
      data: {
        assignmentId: request.assignmentId,
        videoId: request.videoId,
      },
    });
    return res.status(200).json({
      status: RequestStatus.SUCCESS,
      message: "Video version added successfully",
      videoVersionId: videoVersion.id,
    });
  } catch (error) {
    return res.status(400).json({
      status: RequestStatus.FAILURE,
      message: getErrorMessage(error),
    });
  }
}

export async function addCommentToVideoVersion(
  req: express.Request,
  res: express.Response
) {
  try {
    const request: AddCommentToVideoVersion = req.body;
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const videoVersion = await primsaClient.assignmentVideoVersion.findUnique({
      where: {
        id: request.videoVersionId,
      },
      include: {
        assignment: true,
      },
    });
    if (!videoVersion) {
      throw new Error("Video version not found");
    }
    if (
      videoVersion.assignment.reporterId !== user.id &&
      videoVersion.assignment.assigneeId !== user.id
    ) {
      return res.status(401).json({
        status: RequestStatus.FAILURE,
        message: "User not authorized to add comment to this video version",
      });
    }
    const comment = await primsaClient.comment.create({
      data: {
        content: request.comment,
        videoVersionId: request.videoVersionId,
        userId: user.id,
      }
    });
  } catch (error) {
    return res.status(401).json({
      status: RequestStatus.FAILURE,
      message: getErrorMessage(error),
    });
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "UnExpected Error Occured";
}
