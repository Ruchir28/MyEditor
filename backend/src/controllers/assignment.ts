import {
  RequestStatus,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  UpdateAssignmentRequest,
  UpdateAssignmentResponse,
  BaseResponse,
} from "@ruchir28/common";
import express from "express";
import { $Enums } from "@prisma/client";
import {primsaClient} from '../Utils/prismaClient'
export async function createAssignment(
  req: express.Request,
  res: express.Response
) {
  try {
    const request: CreateAssignmentRequest = req.body;
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const assignmentCreationResponse = await primsaClient.assignment.create({
      data: {
        title: request.title,
        reporterId: request.reporterId,
        assigneeId: request.assigneeId,
      },
    });
    return res.status(200).json({
      status: RequestStatus.SUCCESS,
      assignmentId: assignmentCreationResponse.id,
      message: "Assignment created successfully",
    });
  } catch (error) {
    const createAssignmentResponse: CreateAssignmentResponse = {
      status: RequestStatus.FAILURE,
      message: getErrorMessage(error),
    };
    return res.status(400).json(createAssignmentResponse);
  }
}

export async function updateAssignment(
  req: express.Request,
  res: express.Response
) {
  try {
    const request: UpdateAssignmentRequest = req.body;
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const updateData: any = {
        title: request.title,
        reporterId: request.reporterId,
    };
    
    if (request.status) {
        updateData.status = $Enums.Status[request.status];
    }
    
    const updateAssignmentResponse = await primsaClient.assignment.update({
      where: {
        id: request.assignmentId,
      },
      data: updateData,
    });
    return res.status(200).json({
      status: RequestStatus.SUCCESS,
      assignmentId: updateAssignmentResponse.id,
      message: "Assignment Updated successfully",
    });
  } catch (error) {
    const updateAssignmentResponse: UpdateAssignmentResponse = {
      status: RequestStatus.FAILURE,
      message: getErrorMessage(error),
    };
    return res.status(400).json(updateAssignmentResponse);
  }
}


export async function getAssignments(
  req: express.Request,
  res: express.Response
) {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const assignments = await primsaClient.assignment.findMany({
      where: {
        OR: [
          {
            reporterId: user.id,
          },
          {
            assigneeId: user.id,
          },
        ],
      },
    });
    return res.status(200).json({
      status: RequestStatus.SUCCESS,
      assignments,
    });
  } catch (error) {
    const getAssignmentsResponse: BaseResponse = {
      status: RequestStatus.FAILURE,
      message: getErrorMessage(error),
    };
    return res.status(400).json(getAssignmentsResponse);
  }
}


function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "UnExpected Error Occured";
}
