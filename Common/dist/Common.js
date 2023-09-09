"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestStatus = exports.UserType = void 0;
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
