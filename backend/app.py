from flask import Flask
from flask_cors import CORS
from config import Config
from models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    with app.app_context():
        from routes.auth_routes import auth_bp
        from routes.academic_routes import academic_bp
        from routes.staff_routes import staff_bp
        from routes.student_routes import student_bp
        from routes.learning_routes import learning_bp
        from routes.submission_routes import submission_bp
        from routes.admin_routes import admin_bp

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(academic_bp, url_prefix='/api/academic')
        app.register_blueprint(staff_bp, url_prefix='/api/staff')
        app.register_blueprint(student_bp, url_prefix='/api/student')
        app.register_blueprint(learning_bp, url_prefix='/api/learning')
        app.register_blueprint(submission_bp, url_prefix='/api/submission')
        app.register_blueprint(admin_bp, url_prefix='/api/admin')
        
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
