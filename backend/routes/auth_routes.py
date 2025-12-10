from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from models import db, Staff, Student

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Check for admin (hardcoded for now)
    if email == 'admin@lls.com':
        # Admin uses a fixed password for simplicity
        if password == 'admin123':
            return jsonify({
                'message': 'Login successful',
                'role': 'admin',
                'user_id': 0,
                'name': 'Administrator',
                'email': email
            })
        else:
            return jsonify({'message': 'Invalid password'}), 401
    
    # Check Staff with password verification
    staff = Staff.query.filter_by(email=email).first()
    if staff:
        if staff.password_hash and check_password_hash(staff.password_hash, password):
            return jsonify({
                'message': 'Login successful',
                'role': 'staff',
                'user_id': staff.staff_id,
                'name': staff.name,
                'email': staff.email
            })
        else:
            return jsonify({'message': 'Invalid password'}), 401
    
    # Check Student (for future - students might register with password)
    student = Student.query.filter_by(email=email).first()
    if student:
        # For now, students don't have passwords in this system
        return jsonify({'message': 'Student login not available yet'}), 401

    return jsonify({'message': 'User not found'}), 401
