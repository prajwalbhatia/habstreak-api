import StreakDetail from "../models/streakDetail.js";
import Streak from '../models/streak.js';
import Reward from '../models/reward.js';
import RecentActivity from '../models/recentActivity.js';

import mongoose from 'mongoose';
import moment from 'moment';
import cron from 'node-cron';

import asyncHandler from 'express-async-handler';

import { activityObj, throwError } from '../utils.js';

/**
 * 
 * @param {Object} streakDetail - object containing the streak detail data
 * @returns - modified streak detail object
 */
const modifyingStreakDetail = asyncHandler(async (streakDetail) => {
  //Before creating streak detail we have to check
  //if that detail of a particular streak is
  //having any reward assosiate with it or not
  //if yes then make sone changes in streak details value
  //and then save the data
  const rewards = await Reward.find().lean(); //Converting the mongo document into simple object

  //Filtering the reward list according to the data 
  //that user has send
  const filterRewardList = rewards.filter((reward) => {
    const modifiedReward = JSON.parse(JSON.stringify(reward));
    if (modifiedReward.streakId === streakDetail.streakId && moment(moment(modifiedReward.date).format('YYYY-MM-DD')).isSame(moment(streakDetail.date).format('YYYY-MM-DD'))) {
      return reward;
    }
  });

  if (filterRewardList.length > 0) {
    streakDetail.rewards = filterRewardList.map((reward) => reward.title);
    streakDetail.reward = true;
  }
  return streakDetail;
})

//We want to create a new streak detail every day
//if that particular streak is capable of (means they have not reached the limit of the days of streak)
//therefore scheduling a task for everyday 24:00
cron.schedule('1 0 * * *', async () => {
  try {
    //Finding the streaks
    const streaks = await Streak.find().lean();
    const filterStreakData = []
    //userId = streaks.length > 0 && streaks[0].userId;
    //Filtering the data to get the id of streak and no. of days
    await streaks.forEach(data => {
      filterStreakData.push({ days: data.days, id: JSON.parse(JSON.stringify(data._id)), userId: data.userId });
    });

    filterStreakData.map(async (detail) => {
      //Getting the detail of streaks that was filtered
      const streakDetail = await StreakDetail.find({ streakId: detail.id }).lean();
      //Streak Detail will be [] if it was the case of upcoming streak
      const lastStreakDetail = streakDetail.length > 0 ? streakDetail[streakDetail.length - 1] : { description: '' } //if lenth of streak detail is 0 then it must be first streak detail
      const streakId = detail.id;
      const descriptionOfLast = lastStreakDetail.description || ''; //checing the description of last streak detail item
      //We want to create a new detail item if only that particular streak
      //have capability of having more detail item
      //and if previous day streak detail is not filled that means streak is breaked 
      //therefore no further detail will be made and streak will be updated with 'unfinished'
      if (streakDetail.length <= +detail.days) { //it means streak have capabilites of creating more streak details
        if (descriptionOfLast.length > 0 || streakDetail.length === 0) { //last streak detail have some description or it is first streak detail
          let date = moment().format().toString();

          const detailObj = {
            date,
            streakId: detail.id,
            rewards: [],
            userId: detail.userId
          };
          //Creating streak detail
          const modifyingDetail = await modifyingStreakDetail(detailObj);
          const createStreakDetail = new StreakDetail(modifyingDetail);
          await createStreakDetail.save();
        }
        else {
          //UPDATE THE STREAK WITH 'unfinished'
          const updateObj = { tag: 'unfinished' }
          await Streak.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(streakId)}, updateObj, { new: true });

          //As the streak is Unfinished therefore
          //its assosiated rewards should be unassosiated

          //Getting the rewards assosiated with particular streak
          //and removing the streak id and date field that makes it unassociated with any streak
          let userId = '';
          const rewards = await Reward.find({ streakId: mongoose.Types.ObjectId(streakId) }).lean();

          if (rewards.length > 0) {
            userId = detail.userId;
            await Promise.all(rewards.map(async (reward) => {
              if (!reward.rewardEarned) {
                let updatedReward = { ...reward }
                delete updatedReward.streakId;
                delete updatedReward.date

                await Reward.findByIdAndUpdate({_id : reward._id}, updatedReward, { new: true, overwrite: true });
              }
            }));
          }

        }
      }
      else {
        //STREAK IS FINISHED
        //UPDATE THE STREAK WITH 'finished'
        const updateObj = { tag: 'finished' }
        await Streak.findByIdAndUpdate({_id: mongoose.Types.ObjectId(streakId)}, updateObj, { new: true });
      }


      //let userId = '';
      //We have to check if reward is
      //earned then we have to update it

      //Getting the rewards
      const rewards = await Reward.find().lean();

      //userId = rewards.length > 0 && rewards[0].userId;

      await Promise.all(rewards.map(async (reward) => {

        let streakId = reward.streakId;

        let streaks = null;

        if (streakId)
          streaks = await Streak.find({ _id: mongoose.Types.ObjectId(streakId) }).lean();



        if (moment(moment(reward.date).format('YYYY-MM-DD')).isSameOrBefore(moment(new Date()).format('YYYY-MM-DD')) && !reward.rewardEarned && streakId && streaks && !streaks[0].tag) {

          let updatedReward = { ...reward }
          updatedReward.rewardEarned = true;

          const activity = activityObj(reward.userId, 'reward-earned', updatedReward.title, new Date());
          const newActivity = new RecentActivity(activity);
          await newActivity.save();
          await Reward.findByIdAndUpdate({_id : mongoose.Types.ObjectId(reward._id)}, updatedReward, { new: true });


        }
      }));
    })
  } catch (error) {
    console.warn(error._message)
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});


export const createStreakDetail = asyncHandler(async (req, res, next) => {
  if (!req.userId) throwError(next)

  const streakDetail = req.body;
  streakDetail.userId = req.userId;

  const modifyingDetail = await modifyingStreakDetail(streakDetail);
  const createStreakDetail = new StreakDetail(modifyingDetail);
  await createStreakDetail.save();
  res.status(201).json(createStreakDetail);
})

export const getStreakDetail = asyncHandler(async (req, res, next) => {
  const { streakId } = req.params;
  const streakDetail = await StreakDetail.find({ streakId });
  res.status(200).json(streakDetail);
})

export const updateStreakDetail = asyncHandler(async (req, res, next) => {
  const { id: _id } = req.params;
  if (!req.userId) throwError(next)
  const streakDetail = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) throwError(404, `${_id} is invalid`, next);

  const updatedStreakDetail = await StreakDetail.findByIdAndUpdate(_id, streakDetail, { new: true });
  if (!updatedStreakDetail) throwError(404, `Streak Detail not found with id ${_id}`, next);
  res.json(updatedStreakDetail);
});

export const deleteStreakDetail = asyncHandler(async (req, res, next) => {
  const { streakId } = req.params;
  const streakDetail = await StreakDetail.deleteMany({ streakId });

  if (!streakDetail) throwError(404, `Streak Detail not found with id ${_id}`, next);

  res.status(201).json({ message: "Streak Detail deleted successfully" });
});
