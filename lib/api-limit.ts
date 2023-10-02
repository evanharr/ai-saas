import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { MAX_FREE_COUNTS } from "@/constants";

export const increaseApiLimit = async () => {
    const { userId } = auth();

    if(!userId) {
        return;
    }

    //check if user has api limit
    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId
        }
    });

    //if api limit is found add 1 to the total count of api calls 
    if (userApiLimit) {
        await prismadb.userApiLimit.update({
            where: {userId: userId},
            data: {count: userApiLimit.count + 1},

        });

    //if api limit is not found create a new user api limit and add 1 to the total count of api calls
    } else {
        await prismadb.userApiLimit.create ({
            data: { userId: userId, count: 1}
        });
    }


    
};

//check if the api limit is reached 
export const checkApiLimit = async () => {
    const { userId } = auth();

    if(!userId){
        return false;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId: userId
        }
    });

    if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS){
        return true;

    } else {
        return false;
    }

};

export const getApiLimitCount = async () => {
    const { userId } = auth();

    if(!userId){
        return 0;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where:{
            userId
        }

        
    });

    if (!userApiLimit) {
        return 0;
    }

    return userApiLimit.count;
}