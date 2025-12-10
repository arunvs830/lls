from flask import Blueprint, request, jsonify
from models import db, Payment, Certificate, Feedback

admin_bp = Blueprint('admin', __name__)

# Payments
@admin_bp.route('/payments', methods=['POST'])
def record_payment():
    data = request.get_json()
    payment = Payment(
        student_id=data['student_id'],
        amount=data['amount'],
        method=data['method'],
        status=data.get('status', 'Completed')
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify({'message': 'Payment recorded'}), 201

# Certificates
@admin_bp.route('/certificates', methods=['POST'])
def issue_certificate():
    data = request.get_json()
    cert = Certificate(
        student_id=data['student_id'],
        result_id=data.get('result_id'),
        certificate_number=data['certificate_number'],
        status='Issued'
    )
    db.session.add(cert)
    db.session.commit()
    return jsonify({'message': 'Certificate issued'}), 201

# Feedback
@admin_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json()
    fb = Feedback(
        student_id=data['student_id'],
        rating=data['rating'],
        comments=data.get('comments')
    )
    db.session.add(fb)
    db.session.commit()
    return jsonify({'message': 'Feedback submitted'}), 201
