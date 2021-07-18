import StreakDetail from "../models/streakDetail.js";
import mongoose from 'mongoose';

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
    const streakDetail = await StreakDetail.findOne({ streakId });
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
