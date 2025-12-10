from flask import Blueprint, request, jsonify
from models import db, AssignmentSubmission, AssignmentEvaluation, Result

submission_bp = Blueprint('submission', __name__)

# Submit Assignment
@submission_bp.route('/submissions', methods=['POST'])
def submit_assignment():
    data = request.get_json()
    submission = AssignmentSubmission(
        assignment_id=data['assignment_id'],
        student_id=data['student_id'],
        file_path=data.get('file_path'),
        assignment_text=data.get('assignment_text')
    )
    db.session.add(submission)
    db.session.commit()
    return jsonify({'message': 'Assignment submitted successfully'}), 201

# Evaluate Assignment
@submission_bp.route('/evaluations', methods=['POST'])
def evaluate_submission():
    data = request.get_json()
    evaluation = AssignmentEvaluation(
        submission_id=data['submission_id'],
        marks=data['marks'],
        feedback=data.get('feedback'),
        evaluated_by=data.get('evaluated_by')
    )
    db.session.add(evaluation)
    
    # Auto-create Result entry
    # Logic to determine Pass/Fail based on marks (e.g., > 40%)
    status = 'Pass' if float(data['marks']) >= 40 else 'Fail'
    # Need to fetch student_id from submission
    submission = AssignmentSubmission.query.get(data['submission_id'])
    
    result = Result(
        student_id=submission.student_id,
        evaluation_id=evaluation.evaluation_id, # This might need flush first
        status=status,
        grade='A' if float(data['marks']) >= 80 else 'B' # Simple logic
    )
    # We need to commit evaluation first to get ID? No, SQLAlchemy handles it if added to session.
    # But result needs evaluation_id.
    
    db.session.commit() # Commit evaluation first
    
    result.evaluation_id = evaluation.evaluation_id
    db.session.add(result)
    db.session.commit()
    
    return jsonify({'message': 'Evaluation submitted and result generated'}), 201

@submission_bp.route('/students/<int:student_id>/results', methods=['GET'])
def get_student_results(student_id):
    results = Result.query.filter_by(student_id=student_id).all()
    return jsonify([{
        'result_id': r.result_id,
        'status': r.status,
        'grade': r.grade,
        'marks': r.evaluation.marks if r.evaluation else None
    } for r in results])
