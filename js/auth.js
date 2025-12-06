import { supabase } from "../supabaseClient.js";

let guest = false;

export function initAuth() {
    document.getElementById("guest-btn").onclick = () => {
        guest = true;
        document.getElementById("login-panel").classList.add("hidden");
    };

    document.getElementById("login-btn").onclick = async () => {
        const email = prompt("Email:");
        const password = prompt("Password:");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert(error.message);
        } else {
            guest = false;
            document.getElementById("login-panel").classList.add("hidden");
        }
    };
}

export function isGuestMode() {
    return guest;
}

export async function getUser() {
    if (guest) return null;
    return (await supabase.auth.getUser()).data.user;
}
