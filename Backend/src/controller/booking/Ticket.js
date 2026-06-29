import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

//#region Transaction report
export const downloadTicket = async (id, req, res) => {
  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    message: ResponseMessage.FAIL_TO_FETCH,
    data: [],
  });
};
//#endregion
