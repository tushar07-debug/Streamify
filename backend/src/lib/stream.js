import {StreamChat} from  "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;   

if(!apiKey || !apiSecret) {
    console.error("Missing Stream API key or secret is missing");
}

const streamclient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try{
        await streamclient.upsertUsers([userData]);
        return userData
    }catch(error){
        console.log("Error upserting creating stream user : ", error);
    }
};

//TODO: do it later
export const  generateStreamToken = (userId) => {

}