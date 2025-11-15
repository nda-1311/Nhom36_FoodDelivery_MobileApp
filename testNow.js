const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log("Testing anon access to food_items...\n");

const client = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await client
    .from("food_items")
    .select("id, name, price, category, rating")
    .limit(10);

  if (error) {
    console.log("❌ ERROR:", error.message);
    console.log("Code:", error.code);
    console.log("\n🚨 Frontend will NOT work!");
  } else {
    console.log("✅ SUCCESS! Found", data.length, "items\n");
    console.log(data);
    console.log("\n🎉 Frontend SHOULD work now! Reload it!");
  }
}

test();
