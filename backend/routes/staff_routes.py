from flask import Blueprint, request, jsonify
from models import db, Staff

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/staff', methods=['POST'])
def create_staff():
    data = request.get_json()
    
    new_staff = Staff(
        name=data['name'],
        email=data['email'],
        password_hash=data.get('password'),  # Store as plain text
        phone=data.get('phone'),
        qualifications=data.get('qualifications'),
        status=data.get('status', 'Active')
    )
    db.session.add(new_staff)
    db.session.commit()
    return jsonify({'message': 'Staff created successfully', 'staff_id': new_staff.staff_id}), 201

@staff_bp.route('/staff', methods=['GET'])
def get_staff():
    staff_members = Staff.query.all()
    return jsonify([{
        'staff_id': s.staff_id,
        'name': s.name,
        'email': s.email,
        'phone': s.phone,
        'qualifications': s.qualifications,
        'status': s.status,
        'has_password': s.password_hash is not None
    } for s in staff_members])

@staff_bp.route('/staff/<int:staff_id>', methods=['PUT'])
def update_staff(staff_id):
    staff = Staff.query.get_or_404(staff_id)
    data = request.get_json()
    
    if 'name' in data:
        staff.name = data['name']
    if 'email' in data:
        staff.email = data['email']
    if 'phone' in data:
        staff.phone = data['phone']
    if 'qualifications' in data:
        staff.qualifications = data['qualifications']
    if 'status' in data:
        staff.status = data['status']
    if 'password' in data and data['password']:
        staff.password_hash = data['password']  # Store as plain text
    
    db.session.commit()
    return jsonify({'message': 'Staff updated successfully'})

