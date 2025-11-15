const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Testing RPC function...\n");

const client = createClient(supabaseUrl, supabaseAnonKey);

async function testRPC() {
  console.log("1️⃣ Calling RPC: get_available_menu_items()");

  const { data, error } = await client.rpc("get_available_menu_items");

  if (error) {
    console.log("\n❌ RPC FAILED!");
    console.log("Error:", error);
    console.log("Message:", error.message);
    console.log("Code:", error.code);
    console.log("Details:", error.details);
    console.log("Hint:", error.hint);

    console.log("\n🚨 PROBLEM:");
    if (error.message.includes("permission denied")) {
      console.log("➡️  Function exists but lacks EXECUTE permission");
      console.log(
        "➡️  Run: GRANT EXECUTE ON FUNCTION get_available_menu_items() TO anon;"
      );
    } else if (error.message.includes("does not exist")) {
      console.log("➡️  Function not created yet");
      console.log(
        "➡️  Run the CREATE FUNCTION statement in Supabase SQL Editor"
      );
    } else {
      console.log("➡️  Unknown error:", error.message);
    }
  } else {
    console.log("\n✅ RPC SUCCESS!");
    console.log("Items returned:", data?.length);
    console.log("\nSample data:");
    console.log(data?.slice(0, 3));
  }
}

testRPC()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
