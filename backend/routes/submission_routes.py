from flask import Blueprint, request, jsonify
from models import db, AssignmentSubmission, AssignmentEvaluation, Result, Assignment, StudyMaterial, Course, Student

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

# Get all submissions for a staff member's courses
@submission_bp.route('/staff/<int:staff_id>/submissions', methods=['GET'])
def get_staff_submissions(staff_id):
    """Get all assignment submissions for courses taught by this staff"""
    # Get all courses taught by this staff
    staff_courses = Course.query.filter_by(staff_id=staff_id).all()
    
    if not staff_courses:
        return jsonify([])
    
    staff_course_ids = [c.course_id for c in staff_courses]
    
    # Get all materials for these courses
    materials = StudyMaterial.query.filter(
        StudyMaterial.course_id.in_(staff_course_ids)
    ).all()
    
    material_ids = [m.material_id for m in materials]
    
    # Get all assignments for these materials
    assignments = Assignment.query.filter(
        Assignment.material_id.in_(material_ids)
    ).all()
    
    assignment_ids = [a.assignment_id for a in assignments]
    
    # Get all submissions for these assignments
    submissions = AssignmentSubmission.query.filter(
        AssignmentSubmission.assignment_id.in_(assignment_ids)
    ).all()
    
    result = []
    for sub in submissions:
        # Get student info
        student = Student.query.get(sub.student_id)
        # Get assignment info
        assignment = Assignment.query.get(sub.assignment_id)
        material = StudyMaterial.query.get(assignment.material_id) if assignment else None
        course = Course.query.get(material.course_id) if material else None
        
        # Get evaluation if exists
        evaluation = AssignmentEvaluation.query.filter_by(submission_id=sub.submission_id).first()
        
        result.append({
            'submission_id': sub.submission_id,
            'assignment_id': sub.assignment_id,
            'assignment_title': assignment.title if assignment else None,
            'student_id': sub.student_id,
            'student_name': student.name if student else None,
            'student_email': student.email if student else None,
            'course_name': course.course_name if course else None,
            'material_title': material.title if material else None,
            'assignment_text': sub.assignment_text,
            'file_path': sub.file_path,
            'submitted_date': sub.submitted_date.isoformat() if sub.submitted_date else None,
            'is_evaluated': evaluation is not None,
            'marks': float(evaluation.marks) if evaluation and evaluation.marks else None,
            'feedback': evaluation.feedback if evaluation else None
        })
    
    return jsonify(result)

# Evaluate Assignment
@submission_bp.route('/evaluations', methods=['POST'])
def evaluate_submission():
    data = request.get_json()
    
    # Check if already evaluated
    existing = AssignmentEvaluation.query.filter_by(submission_id=data['submission_id']).first()
    
    if existing:
        # Update existing evaluation
        existing.marks = data['marks']
        existing.feedback = data.get('feedback')
        existing.evaluated_by = data.get('evaluated_by')
        db.session.commit()
        return jsonify({'message': 'Evaluation updated successfully'})
    
    evaluation = AssignmentEvaluation(
        submission_id=data['submission_id'],
        marks=data['marks'],
        feedback=data.get('feedback'),
        evaluated_by=data.get('evaluated_by')
    )
    db.session.add(evaluation)
    db.session.commit()
    
    # Auto-create Result entry
    status = 'Pass' if float(data['marks']) >= 40 else 'Fail'
    submission = AssignmentSubmission.query.get(data['submission_id'])
    
    # Calculate grade
    marks = float(data['marks'])
    if marks >= 90:
        grade = 'A+'
    elif marks >= 80:
        grade = 'A'
    elif marks >= 70:
        grade = 'B'
    elif marks >= 60:
        grade = 'C'
    elif marks >= 50:
        grade = 'D'
    else:
        grade = 'F'
    
    result = Result(
        student_id=submission.student_id,
        evaluation_id=evaluation.evaluation_id,
        status=status,
        grade=grade
    )
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
        'marks': float(r.evaluation.marks) if r.evaluation and r.evaluation.marks else None
    } for r in results])

