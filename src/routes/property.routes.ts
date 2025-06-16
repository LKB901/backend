import { Router, Request, Response } from 'express';
import {Property, TheParties, Agent} from '../models';
import {authGuard, AuthReq} from "../middleware/auth.guard";

const router = Router();

/* 매물 등록 (주소, 건물명, 면적 등) */
router.post('/regist',authGuard, async (req: AuthReq, res: Response) => {
  const id = req.agentId;
  const {propertyInfo,landlordInfo} = req.body;
  const landlord = await TheParties.findOne(landlordInfo).select('_id').exec();
  let landlordID;
  if(landlord){
    landlordID = landlord._id;
  }else{
    landlordID = await TheParties.create(landlordInfo);
  }
  const newPropInfo = {
    ...propertyInfo,
    landlord: landlordID
  };
  const newProp = await Property.create(newPropInfo);
  await Agent.findByIdAndUpdate(
      id,
      { $addToSet: { manageProperty: newProp._id } },
      { new: true }
  );
  res.status(201).json({id:newProp._id});

});




/* 매물 리스트 (선택적) */
router.get('/', async (_req, res) => {
  const list = await Property.find().sort({ createdAt: -1 });
  res.json(list);
});

export default router;
