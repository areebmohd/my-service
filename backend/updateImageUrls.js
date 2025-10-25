import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";

dotenv.config();

const updateImageUrls = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updateData = {};

      // Update profile picture URL if it contains localhost
      if (user.profilePic && user.profilePic.includes("localhost:3000")) {
        updateData.profilePic = user.profilePic.replace(
          "http://localhost:3000",
          "https://my-service-backend.onrender.com"
        );
        needsUpdate = true;
        console.log(`Updating profile pic for user ${user.name}: ${user.profilePic} -> ${updateData.profilePic}`);
      }

      // Update section images and videos
      if (user.sections && user.sections.length > 0) {
        const updatedSections = user.sections.map(section => {
          const updatedSection = { ...section.toObject() };
          
          // Update images
          if (section.images && section.images.length > 0) {
            updatedSection.images = section.images.map(img => {
              if (img.includes("localhost:3000")) {
                const updatedImg = img.replace(
                  "http://localhost:3000",
                  "https://my-service-backend.onrender.com"
                );
                console.log(`Updating image URL: ${img} -> ${updatedImg}`);
                return updatedImg;
              }
              return img;
            });
          }

          // Update videos
          if (section.videos && section.videos.length > 0) {
            updatedSection.videos = section.videos.map(vid => {
              if (vid.includes("localhost:3000")) {
                const updatedVid = vid.replace(
                  "http://localhost:3000",
                  "https://my-service-backend.onrender.com"
                );
                console.log(`Updating video URL: ${vid} -> ${updatedVid}`);
                return updatedVid;
              }
              return vid;
            });
          }

          return updatedSection;
        });

        // Check if any sections were actually updated
        const sectionsChanged = JSON.stringify(user.sections) !== JSON.stringify(updatedSections);
        if (sectionsChanged) {
          updateData.sections = updatedSections;
          needsUpdate = true;
        }
      }

      // Update the user if any changes were made
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updateData);
        updatedCount++;
        console.log(`Updated user: ${user.name}`);
      }
    }

    console.log(`\nMigration completed! Updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating image URLs:", error);
    process.exit(1);
  }
};

updateImageUrls();
