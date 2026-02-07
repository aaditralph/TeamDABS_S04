import fs from "fs";
import path from "path";

const testPayload = {
  reportId: "test_report_001",
  societyId: "test_society_001",
  meterImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format",
  composterImageUrl: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format",
  gpsMetadata: {
    latitude: 19.076,
    longitude: 72.8777,
    accuracy: 10,
    timestamp: new Date().toISOString(),
  },
  submittedBy: "test_user_001",
  submissionDate: new Date().toISOString(),
};

const outputPath = path.join(process.cwd(), "n8n-test-payload.json");
fs.writeFileSync(outputPath, JSON.stringify(testPayload, null, 2));

console.log("Test payload saved to:", outputPath);
console.log("\nJSON Content:");
console.log(JSON.stringify(testPayload, null, 2));
