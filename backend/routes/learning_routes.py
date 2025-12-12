from flask import Blueprint, request, jsonify
from models import db, StudyMaterial, Assignment, MCQ, Course, Result, AssignmentSubmission
from datetime import datetime

learning_bp = Blueprint('learning', __name__)

# Study Material Routes
@learning_bp.route('/materials', methods=['POST'])
def upload_material():
    data = request.get_json()
    
    # Get the next order index for this course
    max_order = db.session.query(db.func.max(StudyMaterial.order_index)).filter_by(course_id=data['course_id']).scalar()
    next_order = (max_order or 0) + 1
    
    new_material = StudyMaterial(
        course_id=data['course_id'],
        title=data['title'],
        description=data.get('description'),
        material_type=data.get('material_type', 'video'),
        video_url=data.get('video_url'),
        file_path=data.get('file_path'),
        duration_minutes=data.get('duration_minutes'),
        order_index=next_order,
        uploaded_by=data.get('uploaded_by')
    )
    db.session.add(new_material)
    db.session.commit()
    return jsonify({'message': 'Material uploaded successfully', 'material_id': new_material.material_id}), 201

@learning_bp.route('/courses/<int:course_id>/materials', methods=['GET'])
def get_course_materials(course_id):
    materials = StudyMaterial.query.filter_by(course_id=course_id).order_by(StudyMaterial.order_index).all()
    result = []
    for m in materials:
        # Get assignments and MCQs count for this material
        assignment_count = Assignment.query.filter_by(material_id=m.material_id).count()
        mcq_count = MCQ.query.filter_by(material_id=m.material_id).count()
        
        result.append({
            'material_id': m.material_id,
            'title': m.title,
            'description': m.description,
            'material_type': m.material_type,
            'video_url': m.video_url,
            'file_path': m.file_path,
            'duration_minutes': m.duration_minutes,
            'order_index': m.order_index,
            'upload_date': m.upload_date.isoformat() if m.upload_date else None,
            'assignment_count': assignment_count,
            'mcq_count': mcq_count
        })
    return jsonify(result)

@learning_bp.route('/materials/<int:material_id>', methods=['GET'])
def get_material(material_id):
    m = StudyMaterial.query.get_or_404(material_id)
    # Get assignments for this material
    assignments = [{
        'assignment_id': a.assignment_id,
        'title': a.title,
        'instructions': a.instructions,
        'due_date': str(a.due_date) if a.due_date else None
    } for a in m.assignments]
    
    # Get MCQs for this material
    mcqs = [{
        'mcq_id': q.mcq_id,
        'question': q.question,
        'option_a': q.option_a,
        'option_b': q.option_b,
        'option_c': q.option_c,
        'option_d': q.option_d
    } for q in m.mcqs]
    
    return jsonify({
        'material_id': m.material_id,
        'course_id': m.course_id,
        'title': m.title,
        'description': m.description,
        'material_type': m.material_type,
        'video_url': m.video_url,
        'file_path': m.file_path,
        'duration_minutes': m.duration_minutes,
        'order_index': m.order_index,
        'assignments': assignments,
        'mcqs': mcqs
    })

@learning_bp.route('/materials/<int:material_id>', methods=['DELETE'])
def delete_material(material_id):
    material = StudyMaterial.query.get_or_404(material_id)
    db.session.delete(material)
    db.session.commit()
    return jsonify({'message': 'Material deleted successfully'})

# Assignments
@learning_bp.route('/assignments', methods=['POST'])
def create_assignment():
    data = request.get_json()
    due_date = None
    if data.get('due_date'):
        due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
    
    new_assignment = Assignment(
        material_id=data['material_id'],
        title=data['title'],
        instructions=data.get('instructions'),
        due_date=due_date
    )
    db.session.add(new_assignment)
    db.session.commit()
    return jsonify({'message': 'Assignment created successfully', 'assignment_id': new_assignment.assignment_id}), 201

@learning_bp.route('/materials/<int:material_id>/assignments', methods=['GET'])
def get_assignments(material_id):
    assignments = Assignment.query.filter_by(material_id=material_id).all()
    return jsonify([{
        'assignment_id': a.assignment_id,
        'title': a.title,
        'instructions': a.instructions,
        'due_date': str(a.due_date) if a.due_date else None
    } for a in assignments])

# MCQs / Quizzes
@learning_bp.route('/mcqs', methods=['POST'])
def create_mcq():
    data = request.get_json()
    new_mcq = MCQ(
        material_id=data['material_id'],
        question=data['question'],
        option_a=data['option_a'],
        option_b=data['option_b'],
        option_c=data.get('option_c'),
        option_d=data.get('option_d'),
        correct_option=data['correct_option']
    )
    db.session.add(new_mcq)
    db.session.commit()
    return jsonify({'message': 'Quiz question created successfully', 'mcq_id': new_mcq.mcq_id}), 201

@learning_bp.route('/materials/<int:material_id>/mcqs', methods=['GET'])
def get_mcqs(material_id):
    mcqs = MCQ.query.filter_by(material_id=material_id).all()
    return jsonify([{
        'mcq_id': m.mcq_id,
        'question': m.question,
        'option_a': m.option_a,
        'option_b': m.option_b,
        'option_c': m.option_c,
        'option_d': m.option_d
    } for m in mcqs])

@learning_bp.route('/mcqs/<int:mcq_id>', methods=['DELETE'])
def delete_mcq(mcq_id):
    mcq = MCQ.query.get_or_404(mcq_id)
    db.session.delete(mcq)
    db.session.commit()
    return jsonify({'message': 'Quiz question deleted successfully'})

# Get staff's courses (courses they teach)
@learning_bp.route('/staff/<int:staff_id>/courses', methods=['GET'])
def get_staff_courses(staff_id):
    courses = Course.query.filter_by(staff_id=staff_id).all()
    result = []
    for c in courses:
        material_count = StudyMaterial.query.filter_by(course_id=c.course_id).count()
        result.append({
            'course_id': c.course_id,
            'course_name': c.course_name,
            'description': c.description,
            'credits': c.credits,
            'status': c.status,
            'material_count': material_count
        })
    return jsonify(result)

# Quiz Submissions
@learning_bp.route('/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    student_id = data['student_id']
    answers = data['answers']  # List of {mcq_id, selected_option}
    
    results = []
    correct_count = 0
    total_count = len(answers)
    
    for answer in answers:
        mcq = MCQ.query.get(answer['mcq_id'])
        if mcq:
            is_correct = mcq.correct_option.upper() == answer['selected_option'].upper()
            if is_correct:
                correct_count += 1
            
            # Check if result already exists
            existing_result = Result.query.filter_by(
                student_id=student_id,
                mcq_id=answer['mcq_id']
            ).first()
            
            if existing_result:
                existing_result.status = 'Pass' if is_correct else 'Fail'
                existing_result.grade = 'A' if is_correct else 'F'
            else:
                new_result = Result(
                    student_id=student_id,
                    mcq_id=answer['mcq_id'],
                    status='Pass' if is_correct else 'Fail',
                    grade='A' if is_correct else 'F'
                )
                db.session.add(new_result)
            
            results.append({
                'mcq_id': answer['mcq_id'],
                'is_correct': is_correct,
                'correct_option': mcq.correct_option
            })
    
    db.session.commit()
    
    score_percentage = round((correct_count / total_count) * 100) if total_count > 0 else 0
    
    return jsonify({
        'message': 'Quiz submitted successfully',
        'correct_count': correct_count,
        'total_count': total_count,
        'score_percentage': score_percentage,
        'results': results
    })

# Get student's quiz results for a material
@learning_bp.route('/quiz/results/<int:student_id>/<int:material_id>', methods=['GET'])
def get_quiz_results(student_id, material_id):
    # Get all MCQs for this material
    mcqs = MCQ.query.filter_by(material_id=material_id).all()
    mcq_ids = [m.mcq_id for m in mcqs]
    
    # Get student's results for these MCQs
    results = Result.query.filter(
        Result.student_id == student_id,
        Result.mcq_id.in_(mcq_ids)
    ).all()
    
    return jsonify([{
        'result_id': r.result_id,
        'mcq_id': r.mcq_id,
        'status': r.status,
        'grade': r.grade
    } for r in results])

# Assignment Submissions
@learning_bp.route('/assignments/submit', methods=['POST'])
def submit_assignment():
    data = request.get_json()
    
    # Check if already submitted
    existing = AssignmentSubmission.query.filter_by(
        assignment_id=data['assignment_id'],
        student_id=data['student_id']
    ).first()
    
    if existing:
        # Update existing submission
        existing.assignment_text = data.get('assignment_text')
        existing.file_path = data.get('file_path')
        existing.submitted_date = datetime.utcnow()
        db.session.commit()
        return jsonify({
            'message': 'Assignment updated successfully',
            'submission_id': existing.submission_id
        })
    
    new_submission = AssignmentSubmission(
        assignment_id=data['assignment_id'],
        student_id=data['student_id'],
        file_path=data.get('file_path'),
        assignment_text=data.get('assignment_text')
    )
    db.session.add(new_submission)
    db.session.commit()
    
    return jsonify({
        'message': 'Assignment submitted successfully',
        'submission_id': new_submission.submission_id
    }), 201

# Get student's assignment submissions for a material
@learning_bp.route('/assignments/submissions/<int:student_id>/<int:material_id>', methods=['GET'])
def get_assignment_submissions(student_id, material_id):
    # Get all assignments for this material
    assignments = Assignment.query.filter_by(material_id=material_id).all()
    assignment_ids = [a.assignment_id for a in assignments]
    
    # Get student's submissions for these assignments
    submissions = AssignmentSubmission.query.filter(
        AssignmentSubmission.student_id == student_id,
        AssignmentSubmission.assignment_id.in_(assignment_ids)
    ).all()
    
    result = []
    for s in submissions:
        # Get evaluation if exists
        evaluation = None
        if s.evaluations:
            evaluation = s.evaluations[0]  # Get the first evaluation
        
        result.append({
            'submission_id': s.submission_id,
            'assignment_id': s.assignment_id,
            'file_path': s.file_path,
            'assignment_text': s.assignment_text,
            'submitted_date': s.submitted_date.isoformat() if s.submitted_date else None,
            'is_evaluated': evaluation is not None,
            'marks': float(evaluation.marks) if evaluation and evaluation.marks else None,
            'feedback': evaluation.feedback if evaluation else None
        })
    
    return jsonify(result)


# Get student progress for a course
@learning_bp.route('/student/<int:student_id>/course/<int:course_id>/progress', methods=['GET'])
def get_student_progress(student_id, course_id):
    """Calculate student progress based on completed quizzes and assignments"""
    
    # Get all materials for this course
    materials = StudyMaterial.query.filter_by(course_id=course_id).all()
    material_ids = [m.material_id for m in materials]
    
    # Get total MCQs for this course
    total_mcqs = MCQ.query.filter(MCQ.material_id.in_(material_ids)).count()
    
    # Get total assignments for this course
    total_assignments = Assignment.query.filter(Assignment.material_id.in_(material_ids)).count()
    
    # Get completed quizzes (MCQs with results)
    completed_quizzes = Result.query.filter(
        Result.student_id == student_id,
        Result.mcq_id.isnot(None)
    ).join(MCQ).filter(
        MCQ.material_id.in_(material_ids)
    ).count()
    
    # Get submitted assignments
    assignment_ids = [a.assignment_id for a in Assignment.query.filter(Assignment.material_id.in_(material_ids)).all()]
    submitted_assignments = AssignmentSubmission.query.filter(
        AssignmentSubmission.student_id == student_id,
        AssignmentSubmission.assignment_id.in_(assignment_ids) if assignment_ids else False
    ).count()
    
    # Calculate total items and completed items
    total_items = total_mcqs + total_assignments
    completed_items = completed_quizzes + submitted_assignments
    
    # Calculate progress percentage
    progress_percentage = 0
    if total_items > 0:
        progress_percentage = round((completed_items / total_items) * 100)
    
    return jsonify({
        'total_quizzes': total_mcqs,
        'completed_quizzes': completed_quizzes,
        'total_assignments': total_assignments,
        'submitted_assignments': submitted_assignments,
        'total_items': total_items,
        'completed_items': completed_items,
        'progress_percentage': progress_percentage
    })
