import api, { endpoints } from "../api/client";

export const logActivity = async (action, description) => {
    try {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!userId || !token) return;

        await api.post(endpoints.activityLogs, {
            action: action,
            description: description
        });
    } catch (error) {
        console.error("Gagal mencatat log aktivitas:", error);
    }
};
