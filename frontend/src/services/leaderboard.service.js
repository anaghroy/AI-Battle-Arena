import axios from "axios";

const API_URL =
  import.meta.env.MODE === "production" ? "/api" : "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const leaderboardService = {
  getLeaderboard: async () => {
    const response = await api.get("/leaderboard");
    return response.data.leaderboard;
  },
};

export default leaderboardService;
