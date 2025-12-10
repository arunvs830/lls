from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, AcademicYear, Program, Course, ProgramCourse

academic_bp = Blueprint('academic', __name__)

# Academic Year Routes
@academic_bp.route('/academic-years', methods=['POST'])
def create_academic_year():
    data = request.get_json()
    # Parse date strings to Python date objects
    start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    new_year = AcademicYear(
        year=data['year'],
        start_date=start_date,
        end_date=end_date,
        status=data.get('status', 'Active')
    )
    db.session.add(new_year)
    db.session.commit()
    return jsonify({'message': 'Academic Year created successfully'}), 201

@academic_bp.route('/academic-years', methods=['GET'])
def get_academic_years():
    years = AcademicYear.query.all()
    return jsonify([{
        'academic_year_id': y.academic_year_id,
        'year': y.year,
        'start_date': y.start_date.isoformat(),
        'end_date': y.end_date.isoformat(),
        'status': y.status
    } for y in years])

# Program Routes
@academic_bp.route('/programs', methods=['POST'])
def create_program():
    data = request.get_json()
    new_program = Program(
        program_name=data['program_name'],
        description=data.get('description'),
        duration_months=data.get('duration_months'),
        semester=data.get('semester', 1),
        academic_year_id=data.get('academic_year_id'),
        status=data.get('status', 'Active')
    )
    db.session.add(new_program)
    db.session.commit()
    return jsonify({'message': 'Program created successfully'}), 201

@academic_bp.route('/programs', methods=['GET'])
def get_programs():
    programs = Program.query.all()
    return jsonify([{
        'program_id': p.program_id,
        'program_name': p.program_name,
        'description': p.description,
        'duration_months': p.duration_months,
        'semester': p.semester,
        'academic_year_id': p.academic_year_id,
        'academic_year_name': p.academic_year.year if p.academic_year else None,
        'status': p.status
    } for p in programs])

# Course Routes
@academic_bp.route('/courses', methods=['POST'])
def create_course():
    data = request.get_json()
    new_course = Course(
        course_name=data['course_name'],
        description=data.get('description'),
        credits=data.get('credits'),
        staff_id=data.get('staff_id'),
        status=data.get('status', 'Active')
    )
    db.session.add(new_course)
    db.session.commit()
    
    # Link course to multiple programs if provided
    program_ids = data.get('program_ids', [])
    for program_id in program_ids:
        program_course = ProgramCourse(
            program_id=program_id,
            course_id=new_course.course_id,
            semester=1  # Default semester, can be updated later
        )
        db.session.add(program_course)
    db.session.commit()
    
    return jsonify({'message': 'Course created successfully', 'course_id': new_course.course_id}), 201

@academic_bp.route('/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    result = []
    for c in courses:
        # Get linked programs
        linked_programs = [{
            'program_id': pc.program_id,
            'program_name': pc.program.program_name,
            'semester': pc.program.semester
        } for pc in c.program_courses]
        
        result.append({
            'course_id': c.course_id,
            'course_name': c.course_name,
            'description': c.description,
            'credits': c.credits,
            'staff_id': c.staff_id,
            'teacher_name': c.teacher.name if c.teacher else None,
            'linked_programs': linked_programs,
            'status': c.status
        })
    return jsonify(result)

# Assign Course to Program (with Semester)
@academic_bp.route('/programs/<int:program_id>/courses', methods=['POST'])
def add_course_to_program(program_id):
    data = request.get_json()
    # data expects course_id and semester
    program_course = ProgramCourse(
        program_id=program_id,
        course_id=data['course_id'],
        semester=data['semester']
    )
    db.session.add(program_course)
    db.session.commit()
    return jsonify({'message': 'Course added to program successfully'}), 201

@academic_bp.route('/programs/<int:program_id>/courses', methods=['GET'])
def get_program_courses(program_id):
    program_courses = ProgramCourse.query.filter_by(program_id=program_id).all()
    return jsonify([{
        'program_course_id': pc.program_course_id,
        'course_id': pc.course_id,
        'course_name': pc.course.course_name,
        'semester': pc.semester,
        'credits': pc.course.credits
    } for pc in program_courses])
