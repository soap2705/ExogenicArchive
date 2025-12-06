import { supabase } from "../supabaseClient.js";
import { isGuestMode } from "./auth.js";
import { displayEntries } from "./ui.js";

export async function loadPlanetEntries(planetName, user) {
    let query = supabase
        .from("entries")
        .select("*")
        .eq("planet_name", planetName);

    if (isGuestMode()) {
        query = query.is("user_id", null);
    } else {
        query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) console.error(error);

    displayEntries(data || []);
}
