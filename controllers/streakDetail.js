import StreakDetail from "../models/streakDetail.js";
import Streak from '../models/streak.js';
import Reward from '../models/reward.js';

import mongoose from 'mongoose';
import moment from 'moment';

import cron from 'node-cron';


/**
 * 
 * @param {Object} streakDetail - object containing the streak detail data
 * @returns - modified streak detail object
 */
const modifyingStreakDetail = async (streakDetail) => {
  try {
    //Before creating streak detail we have to check
    //if that detail of a particular streak is
    //having any reward assosiate with it or not
    //if yes then make sone changes in strak details value
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
  } catch (error) {
    console.log(error);
    throw error;
  }
}

//We want to create a new streak detail every day
//if that particular streak is capable of (means they have not reached the limit of the days of streak)
//therefore scheduling a task for everyday 24:00
cron.schedule('1 0 * * *', async () => {
  try {
    let userId = '';
    //We have to check if reward is
    //earned then we have to update it

    //Getting the rewards
    const rewards = await Reward.find().lean();
    userId = rewards.length > 0 && rewards[0].userId;

    const filterRewardData = await Promise.all(rewards.map(async (reward) => {
      if (moment(moment(reward.date).format('YYYY-MM-DD')).isBefore(moment(new Date()).format('YYYY-MM-DD')) && !reward.rewardEarned) {
        let updatedReward = { ...reward }
        updatedReward.rewardEarned = true;
        await Reward.findByIdAndUpdate(reward._id, updatedReward, { new: true });
      }
      return reward;
    }));


    //Finding the streaks
    const streaks = await Streak.find().lean();
    const filterStreakData = []
    userId = streaks.length > 0 && streaks[0].userId;
    //Filtering the data to get the id of strek and no. of days
    await streaks.forEach(data => {
      filterStreakData.push({ days: data.days, id: JSON.parse(JSON.stringify(data._id)) });
    });

    filterStreakData.map(async (detail) => {
      //Getting the detail of streaks that was filtered
      const streakDetail = await StreakDetail.find({ streakId: detail.id }).lean();
      // console.log('🚀 ~ file: streakDetail.js ~ line 61 ~ filterStreakData.map ~ streakDetail', streakDetail);
      //We want to create a new detail item if only that particular streak
      //have capability of having more detail item
      if (streakDetail.length < +detail.days) {
        let date = moment().format();
        const detailObj = {
          date,
          streakId: detail.id,
          rewards: [],
          userId
        };
        //Creating streak detail
        const modifyingDetail = await modifyingStreakDetail(detailObj);
        const createStreakDetail = new StreakDetail(modifyingDetail);
        await createStreakDetail.save();
      }
    })
  } catch (error) {
    console.warn(error.message)
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});


export const createStreakDetail = async (req, res) => {
  if (!req.userId) return res.json({ message: 'Unauthenticated' });

  try {
    const streakDetail = req.body;
    streakDetail.userId = req.userId;

    const modifyingDetail = await modifyingStreakDetail(streakDetail);
    const createStreakDetail = new StreakDetail(modifyingDetail);
    await createStreakDetail.save();
    res.status(201).json(createStreakDetail);
  } catch (error) {
    console.warn(error.message)
    res.status(409).json({ message: error.message });
  }
}

export const getStreakDetail = async (req, res) => {
  const { streakId } = req.params;
  try {
    const streakDetail = await StreakDetail.find({ streakId });
    res.status(200).json(streakDetail);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const updateStreakDetail = async (req, res) => {
  const { id: _id } = req.params;
  if (!req.userId) return res.json({ message: 'Unauthenticated' });
  const streakDetail = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(`${_id} is invalid`);

  try {
    const updatedStreakDetail = await StreakDetail.findByIdAndUpdate(_id, streakDetail, { new: true });
    if (!updatedStreakDetail) {
      return res.status(404).json({
        message: `Streak Detail not found with id ${_id}`
      });
    }
    res.json(updatedStreakDetail);
  } catch (error) {
    console.warn(error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        message: `Streak Detail not found with id ${streakId}`
      });
    }
    return res.status(500).send({
      message: `Error updating streak detail with id ${streakId}`
    });
  }
}

export const deleteStreakDetail = async (req, res) => {
  const { streakId } = req.params;
  try {
    const streakDetail = await StreakDetail.deleteMany({ streakId });

    if (!streakDetail) {
      return res.status(404).json({
        message: `Streak Detail not found with id ${streakId}`
      })
    }

    res.status(201).json({ message: "Streak Detail deleted successfully" });
  } catch (error) {
    console.warn(error)
    if (error.kind === 'ObjectId' || err.name === 'NotFound') {
      return res.status(404).json({
        message: `Streak Detail not found with id ${streakId}`
      });
    }
    return res.status(500).send({
      message: `Could not delete the streak detail with id ${streakId}`
    });
  }
}
