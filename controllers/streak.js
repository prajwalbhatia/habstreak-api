import Streak from '../models/streak.js';
import mongoose from 'mongoose';

export const getStreaks = async (req, res) => {
  try {
    const streaks = await Streak.find();
    res.status(200).json(streaks);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const createStreak = async (req, res) => {
  const streak = req.body;
  const newStreak = new Streak(streak);
  try {
    await newStreak.save();
    res.status(201).json(newStreak);
  } catch (error) {
    console.warn(error.message)
    res.status(409).json({ message: error.message });
  }
}

export const deleteStreak = async (req, res) => {
  const streakId = req.params.id;
  try {
    const streak = await Streak.findByIdAndDelete(streakId);

    if (!streak) {
      return res.status(404).json({
        message: `Streak not found with id ${streakId}`
      })
    }

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
  // if (!req.userId) return res.json({ message: 'Unauthenticated' });
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
        message: `Streak not found with id ${streakId}`
      });
    }
    return res.status(500).send({
      message: `Error updating streak with id ${streakId}`
    });
  }
}
