import { redirect } from "next/navigation";
import TopNav from "@/components/top-nav";
import SignOutButton from "@/components/sign-out-button";
import { unlockableCatalog } from "@/lib/garden";
import { createServerSupabaseWithCookies } from "@/lib/supabase/server";
import { addFriend, sendGesture, updateCustomization, updatePreferences } from "@/app/profile/actions";

const categories = ["Calm", "Focus", "Resilience", "Gratitude", "Mood"];

export default async function ProfilePage() {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_seed_type, friend_code, streak_count")
    .eq("id", sessionData.session.user.id)
    .single();

  let friendCode = profile?.friend_code ?? null;
  if (!friendCode) {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += letters[Math.floor(Math.random() * letters.length)];
    }
    const { data: updated } = await supabase
      .from("profiles")
      .update({ friend_code: code })
      .eq("id", sessionData.session.user.id)
      .select("friend_code")
      .single();
    friendCode = updated?.friend_code ?? code;
  }

  if (!profile?.current_seed_type) {
    redirect("/onboarding/welcome");
  }

  const { data: garden } = await supabase
    .from("user_garden")
    .select("garden_level, background_id, decor_ids, plant_skin, preferred_categories, water, sunlight, soil, bloom")
    .eq("user_id", sessionData.session.user.id)
    .single();

  const { data: friends } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("user_id", sessionData.session.user.id);

  const friendIds = friends?.map((friend) => friend.friend_id) ?? [];
  const { data: friendProfiles } = await supabase
    .from("profiles")
    .select("id, email, friend_code")
    .in("id", friendIds.length ? friendIds : ["00000000-0000-0000-0000-000000000000"]);

  const availableUnlocks = unlockableCatalog.map((unlockable) => {
    const meetsLevel = unlockable.requirementType === "level" && (garden?.garden_level ?? 1) >= unlockable.requirementValue;
    const meetsStreak = unlockable.requirementType === "streak" && (profile.streak_count ?? 0) >= unlockable.requirementValue;
    return {
      ...unlockable,
      unlocked: meetsLevel || meetsStreak,
    };
  });

  const backgrounds = availableUnlocks.filter((item) => item.type === "background");
  const plantSkins = availableUnlocks.filter((item) => item.type === "plant_skin");
  const decors = availableUnlocks.filter((item) => item.type === "decor");

  return (
    <section className="flex flex-1 flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Profile</p>
          <h1 className="font-[var(--font-fraunces)] text-4xl">Customize your garden</h1>
        </div>
        <SignOutButton />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
            <h2 className="font-[var(--font-fraunces)] text-2xl">Preferences</h2>
            <p className="mt-2 text-sm text-ink/70">Tune what actions feel best for you.</p>
            <form action={updatePreferences} className="mt-4 grid gap-3 md:grid-cols-2">
              {categories.map((category) => {
                const selected = garden?.preferred_categories?.includes(category) ?? false;
                return (
                  <label
                    key={category}
                    className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  >
                    <input type="checkbox" name="preferredCategories" defaultChecked={selected} value={category} />
                    <span className="font-semibold text-ink">{category}</span>
                  </label>
                );
              })}
              <button
                type="submit"
                className="col-span-full w-fit rounded-full bg-moss px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Save preferences
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
            <h2 className="font-[var(--font-fraunces)] text-2xl">Garden cosmetics</h2>
            <p className="mt-2 text-sm text-ink/70">Unlock cosmetics as you level up or hit streak milestones.</p>
            <form action={updateCustomization} className="mt-6 grid gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Background</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {backgrounds.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                        item.unlocked ? "border-ink/10 bg-white/90" : "border-ink/5 bg-white/50 text-ink/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="backgroundId"
                        value={item.id}
                        defaultChecked={garden?.background_id === item.id}
                        disabled={!item.unlocked}
                      />
                      <span className="font-semibold">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Plant skin</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {plantSkins.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                        item.unlocked ? "border-ink/10 bg-white/90" : "border-ink/5 bg-white/50 text-ink/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plantSkin"
                        value={item.id}
                        defaultChecked={garden?.plant_skin === item.id}
                        disabled={!item.unlocked}
                      />
                      <span className="font-semibold">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Decor</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {decors.map((item) => {
                    const selected = garden?.decor_ids?.includes(item.id) ?? false;
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                          item.unlocked ? "border-ink/10 bg-white/90" : "border-ink/5 bg-white/50 text-ink/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="decorIds"
                          value={item.id}
                          defaultChecked={selected}
                          disabled={!item.unlocked}
                        />
                        <span className="font-semibold">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-fit rounded-full bg-moss px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Save cosmetics
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Garden stats</p>
            <p className="mt-3 text-sm text-ink/70">
              Water {garden?.water ?? 0} · Sunlight {garden?.sunlight ?? 0} · Soil {garden?.soil ?? 0} · Bloom{" "}
              {garden?.bloom ?? 0}
            </p>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Friend code</p>
            <p className="mt-3 text-2xl font-semibold text-ink">{friendCode ?? "—"}</p>
            <p className="mt-2 text-sm text-ink/70">Share this code to connect privately.</p>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Add a friend</p>
            <form action={addFriend} className="mt-3 flex gap-3">
              <input
                type="text"
                name="friendCode"
                placeholder="Enter code"
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-moss px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Add
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Friends</p>
            <div className="mt-3 grid gap-3">
              {friendProfiles && friendProfiles.length > 0 ? (
                friendProfiles.map((friend) => (
                  <div key={friend.id} className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm">
                    <p className="font-semibold text-ink">{friend.email ?? friend.friend_code}</p>
                    <form action={sendGesture} className="mt-3 flex flex-wrap gap-2">
                      <input type="hidden" name="friendId" value={friend.id} />
                      {[
                        { value: "water", label: "Water" },
                        { value: "sunshine", label: "Sunshine" },
                        { value: "encouragement", label: "Encourage" },
                        { value: "bloom", label: "Bloom" },
                      ].map((gesture) => (
                        <button
                          key={gesture.value}
                          type="submit"
                          name="gestureType"
                          value={gesture.value}
                          className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60"
                        >
                          {gesture.label}
                        </button>
                      ))}
                    </form>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink/60">No friends yet. Add someone with a code.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <TopNav />
    </section>
  );
}
