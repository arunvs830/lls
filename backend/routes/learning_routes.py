from flask import Blueprint, request, jsonify
from models import db, StudyMaterial, Assignment, MCQ, Course
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
