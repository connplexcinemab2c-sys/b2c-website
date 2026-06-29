//#region add edit api
export const createApi = async (body, table) => {
   try {
      let createData = new table(body);
      createData = await createData.save();
      return createData;
   } catch (error) {
      console.log(error, "error");
   }
};
//#endregion

export const updateApi = async (body, table) => {
   try {
      if (body.id) {
         let updateData = await table.findByIdAndUpdate(
            { _id: body.id },
            {
               $set: body,
            },
            {
               new: true,
            }
         );
         return updateData;
      }
   } catch (error) {
      console.log(error, "error");
   }
};
 //#endregion
