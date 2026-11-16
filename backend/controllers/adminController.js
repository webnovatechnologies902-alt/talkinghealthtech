import Newsletter from "../models/Newsletter.js";
import ContactMessage from "../models/ContactMessage.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listNewsletterSubscribers = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery;
  const filter =
    req.validatedQuery.subscribed === undefined
      ? {}
      : { isSubscribed: req.validatedQuery.subscribed };
  const [subscribers, total] = await Promise.all([
    Newsletter.find(filter)
      .select("email isSubscribed subscribedAt unsubscribedAt")
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Newsletter.countDocuments(filter),
  ]);
  return res.status(200).json(
    new ApiResponse(
      200,
      "Newsletter subscribers fetched successfully",
      subscribers,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    ),
  );
});

export const listContactMessages = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery
  const [messages, total] = await Promise.all([
    ContactMessage.find()
      .select("name email message createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(),
  ])
  return res.status(200).json(
    new ApiResponse(200, "Contact messages fetched successfully", messages, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }),
  )
})
