import { supabase } from "../supabaseClient.js";
import { isGuestMode } from "./auth.js";
import { displayEntries } from "./ui.js";

/* Translate Blender mesh name → display name */
export async function getPlanetByBlenderName(blenderName) {
    const { data, error } = await supabase
        .from("planets")
        .select("display_name, description")
        .eq("blender_name", blenderName)
        .single();

    if (error || !data) {
        console.warn("Planet lookup failed:", blenderName);
        return {
            display_name: blenderName,
            description: ""
        };
    }

    return data; 
}

/* Load journal entries */
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
