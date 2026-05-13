import HomeClient from "./HomeClient";
import { createClient } from "@/lib/supabase/server";
import { COUNTER_START } from "@/lib/constants";

export default async function Home() {
  let initialCount = COUNTER_START;
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("counter_cache")
      .select("total_approved")
      .eq("id", 1)
      .single();
    if (data?.total_approved) {
      initialCount = data.total_approved;
    }
  }
  return <HomeClient initialMessages={[]} initialCount={initialCount} />;
}
