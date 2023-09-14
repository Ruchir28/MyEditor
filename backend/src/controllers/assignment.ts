import { RequestStatus, CreateAssignmentRequest, CreateAssignmentResponse } from "@ruchir28/common";
import express from "express";
import { PrismaClient } from "@prisma/client";

const primseClient = new PrismaClient();
export async function createAssignment(
  req: express.Request,
  res: express.Response
) {
    try {
        const request: CreateAssignmentRequest = req.body;
        const user = req.user;
        if(!user){
            throw new Error("User not found");
        }
        const assignmentCreationResponse = await primseClient.assignment.create({
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

function getErrorMessage(error: unknown) {
    if(error instanceof Error){
        return error.message
    }
    return "UnExpected Error Occured";
}
