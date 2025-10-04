import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODBURI)
        console.log('DB connected successfully')
    } catch (error) {
        console.error('Database connection error:', error)
        process.exit(1)
    }
}
