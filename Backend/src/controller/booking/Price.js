import Price from "../../models/Price.js";
import PricePackage from "../../models/PricePackage.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";


//#region priceDetails
export const listPriceDetails = async (req, res) => {
  try {
    let { pGroupCode, cinemaId } = req.params;
    const listPriceDetails = await Price.find({
      cinemaId,
      pGroupCode,
      deletedStatus: 0,
    });
    if (listPriceDetails.length) {
      const pricePackage = await PricePackage.find({
        cinemaId,
        pGroupCode,
        deletedStatus: 0,
      });
      const mergedArray = listPriceDetails.map((priceDetail) => {
        const matchingPackage = pricePackage.find(
          (packages) =>
            packages.pGroupCode === priceDetail.pGroupCode &&
            packages.tTypeCode === priceDetail.tTypeCode &&
            packages.tTypeChildCode !== ""
        );

        if (matchingPackage) {
          const tax3d = pricePackage.find(
            (p) =>
              matchingPackage.pGroupCode === p.pGroupCode &&
              matchingPackage.tTypeCode === p.tTypeCode &&
              p.tTypeChildCode == ""
          );
          const tax = pricePackage.find(
            (p) =>
              matchingPackage.pGroupCode === p.pGroupCode &&
              matchingPackage.tTypeCode === p.tTypeCode &&
              p.tTypeChildCode !== ""
          );
          const is3D = priceDetail.pricePackage !== "N";

          const [chargeValue] =
            priceDetail?.priceAdditionalData?.match(/\d+\.\d+/) || [];
          const pPackCharge = is3D
            ? chargeValue
              ? parseFloat(chargeValue)
              : 0
            : 0;

          const dpPackTax1 = is3D && tax3d ? tax3d.priceTax1 : 0;
          const dpPackTax2 = is3D && tax3d ? tax3d.priceTax2 : 0;
          const pPackTax1 = is3D && tax ? tax.priceTax1 : 0;
          const pPackTax2 = is3D && tax ? tax.priceTax2 : 0;

          return {
            _id: priceDetail._doc._id,
            cinemaId: priceDetail._doc.cinemaId,
            cinemaObjectId: priceDetail._doc.cinemaObjectId,
            pGroupCode: priceDetail._doc.pGroupCode,
            tTypeCode: priceDetail._doc.tTypeCode,
            areaCatCode: priceDetail._doc.areaCatCode,
            bFeeCode: priceDetail._doc.bFeeCode,
            tTypeDescription: priceDetail._doc.tTypeDescription,
            tTypeDescriptionAlt: priceDetail._doc.tTypeDescriptionAlt,
            priceSequence: priceDetail._doc.priceSequence,
            currentPrice: priceDetail._doc.currentPrice,
            priceChildTicket: priceDetail._doc.priceChildTicket,
            pricePackage: priceDetail._doc.pricePackage,
            priceComp: priceDetail._doc.priceComp,
            priceEffectFrom: priceDetail._doc.priceEffectFrom,
            priceEffectTill: priceDetail._doc.priceEffectTill,
            priceTax1: pPackTax1,
            priceTax2: pPackTax2,
            priceTax3: dpPackTax1,
            priceTax4: dpPackTax2,
            priceAdditionalData: priceDetail._doc.priceAdditionalData,
            tTypeHOCode: priceDetail._doc.tTypeHOCode,
            deletedStatus: priceDetail._doc.deletedStatus,
            pPackPriceEach: is3D
              ? matchingPackage.pPackPriceEach
              : priceDetail.pPackPriceEach,
            // pPackCharge: is3D
            //   ? matchingPackage.pPackCharge
            //   : priceDetail.pPackCharge,
            pPack3DCharge: pPackCharge,
          };
        }

        return priceDetail;
      });

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.PRICE_LIST,
        data: mergedArray,
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.PRICE_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion