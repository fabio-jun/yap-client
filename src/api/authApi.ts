import api from "./axiosInstance";

//API calls

export const registerUser = (data: { userName: string; email: string; password: string }) => {
    // Makes a POST request to the /auth/register endpoint with the provided data
    return api.post("/auth/register", data);

};

export const loginUser = (data: { email: string; password: string }) => {
    // Makes a POST request to the /auth/login endpoint with the provided data
    return api.post("/auth/login", data);
};

export const refreshToken = (refreshToken: string) => {
    // Makes a POST request to the /auth/refresh endpoint with the provided refresh token
    return api.post("/auth/refresh", refreshToken);
};

