from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class AcademicYear(db.Model):
    __tablename__ = 'academic_year'
    academic_year_id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.String(20), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('Active', 'Inactive', name='academic_status'), default='Active')

class Program(db.Model):
    __tablename__ = 'program'
    program_id = db.Column(db.Integer, primary_key=True)
    program_name = db.Column(db.String(100), nullable=False)  # e.g., BCA, BCom
    description = db.Column(db.Text)
    duration_months = db.Column(db.Integer)
    semester = db.Column(db.Integer, nullable=False, default=1)  # Which semester this program is (1, 2, 3, etc.)
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_year.academic_year_id'), nullable=True)
    status = db.Column(db.Enum('Active', 'Inactive', name='program_status'), default='Active')
    academic_year = db.relationship('AcademicYear', backref='programs', lazy=True)
    program_courses = db.relationship('ProgramCourse', backref='program', lazy=True)

class Course(db.Model):
    __tablename__ = 'course'
    course_id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100), nullable=False)  # e.g., German A1, French B1
    description = db.Column(db.Text)
    credits = db.Column(db.Integer)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=True)  # Teacher/Tutor for this course
    status = db.Column(db.Enum('Active', 'Inactive', name='course_status'), default='Active')
    teacher = db.relationship('Staff', backref='courses_taught', lazy=True)
    materials = db.relationship('StudyMaterial', backref='course', lazy=True)
    # Course can be linked to multiple programs via ProgramCourse table

class ProgramCourse(db.Model):
    __tablename__ = 'program_course'
    program_course_id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('program.program_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.course_id'), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    course = db.relationship('Course', backref='program_courses')

class Staff(db.Model):
    __tablename__ = 'staff'
    staff_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Hashed password
    phone = db.Column(db.String(20))
    qualifications = db.Column(db.Text)
    status = db.Column(db.Enum('Active', 'Inactive', name='staff_status'), default='Active')
    uploaded_materials = db.relationship('StudyMaterial', backref='uploader', lazy=True)
    evaluations = db.relationship('AssignmentEvaluation', backref='evaluator', lazy=True)

class StudyMaterial(db.Model):
    __tablename__ = 'study_material'
    material_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.course_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    material_type = db.Column(db.Enum('video', 'document', 'quiz', 'assignment', name='material_type'), default='video')
    video_url = db.Column(db.String(500))  # YouTube or other video links
    file_path = db.Column(db.String(255))  # For uploaded files
    duration_minutes = db.Column(db.Integer)  # Duration in minutes
    order_index = db.Column(db.Integer, default=0)  # Order in the course
    upload_date = db.Column(db.Date, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('staff.staff_id'))
    assignments = db.relationship('Assignment', backref='material', lazy=True)
    mcqs = db.relationship('MCQ', backref='material', lazy=True)

class Assignment(db.Model):
    __tablename__ = 'assignment'
    assignment_id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey('study_material.material_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    instructions = db.Column(db.Text)
    due_date = db.Column(db.Date)
    submissions = db.relationship('AssignmentSubmission', backref='assignment', lazy=True)

class MCQ(db.Model):
    __tablename__ = 'mcq'
    mcq_id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey('study_material.material_id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(200))
    option_b = db.Column(db.String(200))
    option_c = db.Column(db.String(200))
    option_d = db.Column(db.String(200))
    correct_option = db.Column(db.String(1)) # 'A', 'B', 'C', or 'D'
    results = db.relationship('Result', backref='mcq', lazy=True)

class Student(db.Model):
    __tablename__ = 'student'
    student_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    dob = db.Column(db.Date)
    contact = db.Column(db.String(20))
    parent_name = db.Column(db.String(100))
    parent_contact = db.Column(db.String(20))
    parent_email = db.Column(db.String(100))
    program_id = db.Column(db.Integer, db.ForeignKey('program.program_id'), nullable=True) # Student enrolls in a program
    # course_id = db.Column(db.Integer, db.ForeignKey('course.course_id')) # Optional: if student takes single course
    program = db.relationship('Program', backref='students', lazy=True)
    payments = db.relationship('Payment', backref='student', lazy=True)
    submissions = db.relationship('AssignmentSubmission', backref='student', lazy=True)
    results = db.relationship('Result', backref='student', lazy=True)
    certificates = db.relationship('Certificate', backref='student', lazy=True)
    feedbacks = db.relationship('Feedback', backref='student', lazy=True)

class Payment(db.Model):
    __tablename__ = 'payment'
    payment_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)
    method = db.Column(db.Enum('Card', 'Bank Transfer', 'Cash', name='payment_method'))
    status = db.Column(db.Enum('Pending', 'Completed', 'Failed', name='payment_status'), default='Pending')

class AssignmentSubmission(db.Model):
    __tablename__ = 'assignment_submission'
    submission_id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.assignment_id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    file_path = db.Column(db.String(255))
    submitted_date = db.Column(db.Date, default=datetime.utcnow)
    assignment_text = db.Column(db.Text) # Renamed from 'assignemnt' in doc to be clearer
    evaluations = db.relationship('AssignmentEvaluation', backref='submission', lazy=True)
    communications = db.relationship('Communication', backref='submission', lazy=True)

class AssignmentEvaluation(db.Model):
    __tablename__ = 'assignment_evaluation'
    evaluation_id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('assignment_submission.submission_id'), nullable=False)
    marks = db.Column(db.Numeric(5, 2))
    feedback = db.Column(db.Text)
    evaluated_by = db.Column(db.Integer, db.ForeignKey('staff.staff_id'))
    results = db.relationship('Result', backref='evaluation', lazy=True)

class Result(db.Model):
    __tablename__ = 'result'
    result_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    evaluation_id = db.Column(db.Integer, db.ForeignKey('assignment_evaluation.evaluation_id'), nullable=True)
    mcq_id = db.Column(db.Integer, db.ForeignKey('mcq.mcq_id'), nullable=True)
    status = db.Column(db.Enum('Pass', 'Fail', name='result_status'))
    grade = db.Column(db.String(5))
    communications = db.relationship('Communication', backref='result', lazy=True)
    certificates = db.relationship('Certificate', backref='result', lazy=True)

class Communication(db.Model):
    __tablename__ = 'communication'
    communication_id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('assignment_submission.submission_id'), nullable=True)
    result_id = db.Column(db.Integer, db.ForeignKey('result.result_id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    sent_date = db.Column(db.DateTime, default=datetime.utcnow)

class Certificate(db.Model):
    __tablename__ = 'certificate'
    certificate_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    result_id = db.Column(db.Integer, db.ForeignKey('result.result_id'), nullable=True)
    issue_date = db.Column(db.Date, default=datetime.utcnow)
    certificate_number = db.Column(db.String(50), unique=True)
    status = db.Column(db.Enum('Issued', 'Pending', 'Revoked', name='certificate_status'), default='Pending')

class Feedback(db.Model):
    __tablename__ = 'feedback'
    feedback_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    rating = db.Column(db.Integer)
    comments = db.Column(db.Text)
    date = db.Column(db.Date, default=datetime.utcnow)
