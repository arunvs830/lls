import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const getAcademicYears = async () => {
    const response = await api.get('/academic/academic-years');
    return response.data;
};

export const createAcademicYear = async (data) => {
    const response = await api.post('/academic/academic-years', data);
    return response.data;
};

export const getPrograms = async () => {
    const response = await api.get('/academic/programs');
    return response.data;
};

export const createProgram = async (data) => {
    const response = await api.post('/academic/programs', data);
    return response.data;
};

export const getCourses = async () => {
    const response = await api.get('/academic/courses');
    return response.data;
};

// Get courses assigned to a specific staff member
export const getStaffCourses = async (staffId) => {
    const response = await api.get(`/academic/staff/${staffId}/courses`);
    return response.data;
};

export const createCourse = async (data) => {
    const response = await api.post('/academic/courses', data);
    return response.data;
};

export const addCourseToProgram = async (programId, data) => {
    const response = await api.post(`/academic/programs/${programId}/courses`, data);
    return response.data;
};

export const getProgramCourses = async (programId) => {
    const response = await api.get(`/academic/programs/${programId}/courses`);
    return response.data;
};

export const getStaff = async () => {
    const response = await api.get('/staff/staff');
    return response.data;
};

export const createStaff = async (data) => {
    const response = await api.post('/staff/staff', data);
    return response.data;
};

export default api;
