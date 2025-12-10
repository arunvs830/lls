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

// Student self-registration
export const registerStudent = async (data) => {
    const response = await api.post('/student/register', data);
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

export const getPrograms = async (academicYearId = null) => {
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    const response = await api.get('/academic/programs', { params });
    return response.data;
};

export const createProgram = async (data) => {
    const response = await api.post('/academic/programs', data);
    return response.data;
};

export const getCourses = async (academicYearId = null) => {
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    const response = await api.get('/academic/courses', { params });
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

// Get all students (optionally filtered by course)
export const getStudents = async (courseId = null) => {
    const params = courseId ? { course_id: courseId } : {};
    const response = await api.get('/student/students', { params });
    return response.data;
};

// Get students for a specific staff member (students in their courses)
export const getStaffStudents = async (staffId, courseId = null) => {
    const params = courseId ? { course_id: courseId } : {};
    const response = await api.get(`/student/staff/${staffId}/students`, { params });
    return response.data;
};

export default api;
