import Reward from '../models/reward.js';
import mongoose from 'mongoose';

export const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.status(200).json(rewards);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const createReward = async (req, res) => {
  const reward = req.body;
  const newReward = new Reward(reward);
  try {
    await newReward.save();
    res.status(201).json(newReward);
  } catch (error) {
    console.warn(error.message)
    res.status(409).json({ message: error.message });
  }
}

export const deleteReward = async (req, res) => {
  const rewardId = req.params.id;
  try {
    const reward = await Reward.findByIdAndDelete(rewardId);

    if (!reward) {
      return res.status(404).json({
        message: `Reward not found with id ${rewardId}`
      })
    }

    res.status(201).json({ message: "Reward deleted successfully" });
  } catch (error) {
    console.warn(error)
    if (error.kind === 'ObjectId' || err.name === 'NotFound') {
      return res.status(404).json({
        message: `Reward not found with id ${rewardId}`
      });
    }
    return res.status(500).send({
      message: `Could not delete the reward with id ${rewardId}`
    });
  }
}

export const updateReward = async (req, res) => {
  const { id: _id } = req.params;
  // if (!req.userId) return res.json({ message: 'Unauthenticated' });
  const reward = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(`${_id} is invalid`);

  try {
    const updatedReward = await Reward.findByIdAndUpdate(_id, reward, { new: true });
    if (!updatedReward) {
      return res.status(404).json({
        message: `Reward not found with id ${_id}`
      });
    }
    res.json(updatedReward);
  } catch (error) {
    console.warn(error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        message: `Reward not found with id ${_id}`
      });
    }
    return res.status(500).send({
      message: `Error updating reward with id ${_id}`
    });
  }
}
