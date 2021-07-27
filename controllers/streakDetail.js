import StreakDetail from "../models/streakDetail.js";
import Streak from '../models/streak.js';

import mongoose from 'mongoose';

import cron from 'node-cron';

//We want to create a new streak detail every day
//if that particular streak is capable of (means they have not reached the limit of the days of streak)
//therefore scheduling a task for everyday 24:00
cron.schedule('00 00 * * *', async () => {
  try {
    //Finding the streaks
    const streaks = await Streak.find();
    const filterStreakData = []
    //Filtering the data to get the id of strek and no. of days
    await streaks.forEach(data => {
      filterStreakData.push({ days: data.days, id: data._id });
    });

    filterStreakData.map(async (detail) => {
      //Getting the detail of streaks that was filtered
      const streakDetail = await StreakDetail.find({ streakId: detail.id });
      //We want to create a new detail item if only that particular streak
      //have capability of having more detail item
      if (streakDetail.length < +detail.days) {
        const lastData = streakDetail[streakDetail.length - 1];
        let date = new Date();
        const detailObj = {
          date: date.setDate(date.getDate() + 1),
          streakId: detail.id,
          rewards: [],
        };
        //Creating streak detail
        const createStreakDetail = new StreakDetail(detailObj);
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
  const streakDetail = req.body;
  const createStreakDetail = new StreakDetail(streakDetail);
  try {
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
  // if (!req.userId) return res.json({ message: 'Unauthenticated' });
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
    const streakDetail = await StreakDetail.deleteMany({streakId});

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
