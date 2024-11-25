from flask import Flask, request, jsonify
from utils import pdf_to_pil_images, get_response_from_gpt, generate_faq_from_gpt, gather_all_responses
from flask_cors import CORS
import json


app = Flask(__name__)
CORS(app)

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdf'):
        pdf_bytes = file.read()
        images = pdf_to_pil_images(pdf_bytes)
        # gpt_response = gather_all_responses(images)
        gpt_response = get_response_from_gpt(images)
        
        # print(gpt_response)
        # You might want to process these images further or store them
        return jsonify({"message": "Response generated", "data": gpt_response}), 200
    
    return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400

@app.route('/get_gpt_response', methods=['POST'])
def gpt_response():
    if not request.json or 'texts' not in request.json:
        return jsonify({"error": "Text data is missing"}), 400

    texts = request.json['texts']
    gpt_response = get_response_from_gpt(texts)
    
    return jsonify({"gpt_response": gpt_response}), 200

@app.route('/get-faq', methods=['POST'])
def get_faq():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdf'):
        pdf_bytes = file.read()
        images = pdf_to_pil_images(pdf_bytes)
        gpt_response = generate_faq_from_gpt(images)
        # print(dict(gpt_response))
        # You might want to process these images further or store them
        return jsonify({"message": "Response generated", "data": gpt_response}), 200
    
    return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400



# Main entry point for running the app
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5050)