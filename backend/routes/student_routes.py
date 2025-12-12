from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Student, Program, Course, ProgramCourse

student_bp = Blueprint('student', __name__)

@student_bp.route('/register', methods=['POST'])
def register_student():
    """Public endpoint for student self-registration"""
    data = request.get_json()
    
    # Check if email already exists
    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Parse date of birth if provided
    dob = None
    if data.get('dob'):
        try:
            dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    new_student = Student(
        name=data['name'],
        email=data['email'],
        password_hash=data.get('password'),  # Store as plain text
        dob=dob,
        contact=data.get('contact'),
        parent_name=data.get('parent_name'),
        parent_contact=data.get('parent_contact'),
        parent_email=data.get('parent_email'),
        course_id=data.get('course_id')
    )
    db.session.add(new_student)
    db.session.commit()
    return jsonify({'message': 'Student registered successfully', 'student_id': new_student.student_id}), 201

@student_bp.route('/students', methods=['POST'])
def create_student():
    """Admin endpoint to create a student"""
    data = request.get_json()
    
    dob = None
    if data.get('dob'):
        try:
            dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    new_student = Student(
        name=data['name'],
        email=data['email'],
        password_hash=data.get('password'),  # Store as plain text
        dob=dob,
        contact=data.get('contact'),
        parent_name=data.get('parent_name'),
        parent_contact=data.get('parent_contact'),
        parent_email=data.get('parent_email'),
        course_id=data.get('course_id'),
        program_id=data.get('program_id')
    )
    db.session.add(new_student)
    db.session.commit()
    return jsonify({'message': 'Student created successfully'}), 201

@student_bp.route('/students', methods=['GET'])
def get_students():
    # Optional filter by course_id
    course_id = request.args.get('course_id', type=int)
    
    if course_id:
        # Get students directly enrolled in this course
        students = Student.query.filter_by(course_id=course_id).all()
    else:
        students = Student.query.all()
    
    return jsonify([{
        'student_id': s.student_id,
        'name': s.name,
        'email': s.email,
        'contact': s.contact,
        'program_id': s.program_id,
        'program_name': s.program.program_name if s.program else None,
        'course_id': s.course_id,
        'course_name': s.course.course_name if s.course else None
    } for s in students])

@student_bp.route('/students/<int:student_id>', methods=['GET'])
def get_student_profile(student_id):
    student = Student.query.get_or_404(student_id)
    return jsonify({
        'student_id': student.student_id,
        'name': student.name,
        'email': student.email,
        'dob': str(student.dob),
        'contact': student.contact,
        'parent_name': student.parent_name,
        'program_id': student.program_id
    })

# Get students for a specific staff member (students enrolled in courses taught by this staff)
@student_bp.route('/staff/<int:staff_id>/students', methods=['GET'])
def get_staff_students(staff_id):
    """Get students enrolled in courses taught by this staff member"""
    # Optional filter by specific course
    course_id = request.args.get('course_id', type=int)
    
    # Get courses taught by this staff
    staff_courses = Course.query.filter_by(staff_id=staff_id).all()
    
    if not staff_courses:
        return jsonify([])
    
    # Get all course IDs for this staff
    staff_course_ids = [c.course_id for c in staff_courses]
    
    # If filtering by specific course, verify it belongs to this staff
    if course_id:
        if course_id not in staff_course_ids:
            return jsonify({'error': 'Course not assigned to this staff'}), 403
        filter_course_ids = [course_id]
    else:
        filter_course_ids = staff_course_ids
    
    # Get students directly enrolled in these courses (via course_id field)
    students = Student.query.filter(
        Student.course_id.in_(filter_course_ids)
    ).all()
    
    return jsonify([{
        'student_id': s.student_id,
        'name': s.name,
        'email': s.email,
        'contact': s.contact,
        'course_id': s.course_id,
        'course_name': s.course.course_name if s.course else None
    } for s in students])

