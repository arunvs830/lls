from flask import Blueprint, request, jsonify
from models import db, Student, Program

student_bp = Blueprint('student', __name__)

@student_bp.route('/students', methods=['POST'])
def register_student():
    data = request.get_json()
    new_student = Student(
        name=data['name'],
        email=data['email'],
        dob=data.get('dob'),
        contact=data.get('contact'),
        parent_name=data.get('parent_name'),
        parent_contact=data.get('parent_contact'),
        parent_email=data.get('parent_email'),
        program_id=data.get('program_id')
    )
    db.session.add(new_student)
    db.session.commit()
    return jsonify({'message': 'Student registered successfully'}), 201

@student_bp.route('/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([{
        'student_id': s.student_id,
        'name': s.name,
        'email': s.email,
        'program_name': s.program.program_name if s.program else None
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
