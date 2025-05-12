import os
from flask import jsonify, current_app
from flask_migrate import Migrate
from config import create_app, db

# Create the Flask app using the factory
app = create_app()

# Initialize database migrations
migrate = Migrate(app, db)

# Health check endpoint
def health_check():
    return jsonify({"status": "healthy", "message": "Server is running!"}), 200
app.add_url_rule('/health', 'health_check', health_check, methods=['GET'])

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"message": "Page not found", "error": str(e)}), 404

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "File too large! Max size allowed is 16MB."}), 413

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def serve_uploaded(filename):
    return current_app.send_static_file(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))

# Only run this if executed directly (i.e., development mode)
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv('FLASK_RUN_PORT', 5000)))
