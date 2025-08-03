import User from "../models/User.js";
import FriendRequest from "../models/FriendrRequest.js";

export async function getRecommendedUsers(req, res) {
    try{
        const currentUserId = req.user.id;
        const currentUser = req.user

        const getRecommendedUsers=await User.find({
            $and:[
                {_id:{$ne:currentUserId}}, //exclude current user
                {$id:{$ne:currentUser.friends}}, //exclude current user's friend
                {isOnboarded:true}
            ]
        })
        res.status(200).json(RecommendedUsers);
    }catch(error)
    {
        console.log("Error in getRecommendedUsers: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try{
        const user = await User.findById(req.user.id).select("friends")
        .populate("friends","fullName profilePic nativeLanguage learningLanguage");
        res.status(200).json(user.friends);
    }catch(error)
    {
        console.log("Error in getMyFriends: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function sendFriendRequest(req, res) {
    try{
        const myId = req.user.id
        const{id:recipientId} = req.params

        //prevent sending req to yourself
        if(myId===recipientId)
        {
            return res.status(400).json({ message: "You cannot send friend request to yourself" });
        }

        const recipient = await User.findById(recipientId)
        if(!recipient)
        {
            return res.status(404).json({ message: "Recipient not found" });
        }
        //check id the user is already exist
        if(recipient.friends.includes(myId))
        {
            return res.status(400).json({ message: "You are already friends with this user" });
        }
        //check if a req already exist
        const existingRequest = await User.findOne({
            $or:[
                {sender:myId,recipient:recipientId},
                {sender:recipientId,recipient:myId}
            ],
        });
        if(existingRequest)
        {
            return res.status(400).json({ message: "A Friend request already exist between you and this user" });
        }
        const friendRequest = await User.create({
            sender:myId,
            recipient:recipientId,
        })
        res.status(201).json(friendRequest);
    }catch(error)
    {
        console.log("Error in sendFriendRequest: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try{
        const {id:requestId} = req.params
        const friendRequest = await FriendRequest.findById(requestId)
        if(!friendRequest)
        {
            return res.status(404).json({ message: "Friend request not found" });
        }
        //verify the current user is the recipient
        if(friendRequest.recipient.toString()!==req.user.id)
        {
            return res.status(403).json({ message: "You are not authorised to accept this request " });
        }
        friendRequest.status = "accepted"
        await friendRequest.save()

        //add each user to the other's friend array
        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet:{friends:friendRequest.recipient}
        });
        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{friends:friendRequest.sender}
        });

        res.status(200).json({ message: "Friend request accepted successfully" });
    }catch(error)
    {
        console.log("Error in acceptFriendRequest: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getFriendRequests(req, res) {
    try{
        const incomingRequests = await FriendRequest.find({
            recipient:req.user.id,
            status:"pending"
        }).populate("sender","fullName profilePic nativeLanguage learningLanguage");
        const acceptedRequests = await FriendRequest.find({
            sender:req.user.id,
            status:"accepted"
        }).populate("recipient","fullName profilePic");

        res.status(200).json({incomingRequests,acceptedRequests});
    }catch(error)
    {
        console.log("Error in getPendingFriendRequests controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try{
        const outgoingRequests = await FriendRequest.find({
            sender:req.user.id,
            status:"pending"
        }).populate("recipient","fullName profilePic nativeLanguage learningLanguage");
        res.status(200).json(outgoingRequests);
    }catch(error)
    {
        console.log("Error in getOutgoingFriendRequests controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}