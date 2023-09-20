"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentStatus = exports.RequestStatus = exports.UserType = void 0;
var UserType;
(function (UserType) {
    UserType["OWNER"] = "OWNER";
    UserType["EDITOR"] = "EDITOR";
})(UserType || (exports.UserType = UserType = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["SUCCESS"] = "SUCCESS";
    RequestStatus["FAILURE"] = "FAILURE";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var AssignmentStatus;
(function (AssignmentStatus) {
    AssignmentStatus["OPEN"] = "OPEN";
    AssignmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AssignmentStatus["REVIEW"] = "REVIEW";
    AssignmentStatus["DONE"] = "DONE";
    AssignmentStatus["CANCELLED"] = "CANCELLED";
})(AssignmentStatus || (exports.AssignmentStatus = AssignmentStatus = {}));
