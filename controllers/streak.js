import Streak from '../models/streak.js';
import Reward from '../models/reward.js';
import RecentActivity from '../models/recentActivity.js';
import StreakDetail from "../models/streakDetail.js";

import moment from 'moment';


import mongoose from 'mongoose';

import { activityObj } from '../utils.js';

export const getStreaks = async (req, res) => {
  if (!req.userId) return res.json({ message: 'Unauthenticated' });

  try {
    const userId = req.userId;
    //Aggregating the reward with streak
    const streaks = await Streak.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $lookup: {
          from: 'rewards',
          localField: '_id',
          foreignField: 'streakId',
          as: 'rewards'
        }
      },
    ]);

    res.status(200).json(streaks);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const createStreak = async (req, res) => {
  if (!req.userId) return res.json({ message: 'Unauthenticated' });

  const streak = req.body;
  streak.userId = req.userId;
  const newStreak = new Streak(streak);
  const activity = activityObj(req.userId, 'create-streak', streak.title, moment().format() );
  const newActivity = new RecentActivity(activity);
  try {
    await newStreak.save();
    await newActivity.save();

    res.status(201).json(newStreak);
  } catch (error) {
    console.warn(error.message)
    res.status(409).json({ message: error.message });
  }
}

export const deleteStreak = async (req, res) => {
  const streakId = req.params.id;
  if (!req.userId) return res.json({ message: 'Unauthenticated' });

  try {
    const streak = await Streak.findByIdAndDelete(streakId);
    const activity = activityObj(req.userId, 'delete-streak', streak.title, new Date());
    const newActivity = new RecentActivity(activity);
    await newActivity.save();

    if (!streak) {
      return res.status(404).json({
        message: `Streak not found with id ${streakId}`
      })
    }

    //Deleting streak detail realated to streak
    await StreakDetail.deleteMany({ streakId });
    res.status(201).json({ message: "Streak deleted successfully" });
  } catch (error) {
    console.warn(error)
    if (error.kind === 'ObjectId' || err.name === 'NotFound') {
      return res.status(404).json({
        message: `Streak not found with id ${streakId}`
      });
    }
    return res.status(500).send({
      message: `Could not delete the streak with id ${streakId}`
    });
  }
}

export const deleteStreakAndRewardUpdate = async (req, res) => {
  const streakId = req.params.id;
  if (!req.userId) return res.json({ message: 'Unauthenticated' });
  try {
    //Getting the rewards assosiated with particular streak
    //and removing the streak id and date field
    let userId = '';
    const rewards = await Reward.find({ streakId }).lean();

    if (rewards.length > 0) {
      userId = rewards[0].userId;
      await Promise.all(rewards.map(async (reward) => {
        if (!reward.rewardEarned) {
          let updatedReward = { ...reward }
          delete updatedReward.streakId;
          delete updatedReward.date

          await Reward.findByIdAndUpdate(reward._id, updatedReward, { new: true, overwrite: true });
        }
      }));
    }

    //Finding the streak and deleting 
    const streak = await Streak.findByIdAndDelete(streakId);
    const activity = activityObj(req.userId, 'delete-streak', streak.title, new Date());
    const newActivity = new RecentActivity(activity);
    await newActivity.save();

    if (!streak) {
      return res.status(404).json({
        message: `Streak not found with id ${streakId}`
      })
    }

    // //Deleting streak detail realated to streak
    await StreakDetail.deleteMany({ streakId });
    res.status(201).json({ message: "Streak deleted successfully" });
  } catch (error) {
    console.warn(error)
    if (error.kind === 'ObjectId' || err.name === 'NotFound') {
      return res.status(404).json({
        message: `Streak not found with id ${streakId}`
      });
    }
    return res.status(500).send({
      message: `Could not delete the streak with id ${streakId}`
    });
  }
}

export const updateStreak = async (req, res) => {
  const { id: _id } = req.params;
  if (!req.userId) return res.json({ message: 'Unauthenticated' });
  const streak = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(`${_id} is invalid`);

  try {
    const updatedStreak = await Streak.findByIdAndUpdate(_id, streak, { new: true });
    if (!updateStreak) {
      return res.status(404).json({
        message: `Streak not found with id ${_id}`
      });
    }
    res.json(updatedStreak);
  } catch (error) {
    console.warn(error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        message: `Streak not found with id ${_id}`
      });
    }
    return res.status(500).send({
      message: `Error updating streak with id ${id}`
    });
  }
}
