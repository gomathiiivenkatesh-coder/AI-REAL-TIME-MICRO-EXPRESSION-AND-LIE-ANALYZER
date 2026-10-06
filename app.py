from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

expression_history = []


@app.route("/")
def home():
    return "Backend Connected Successfully!"


@app.route("/api/status")
def status():
    return jsonify({
        "status": "success",
        "message": "AI Backend is working"
    })


@app.route("/api/expression", methods=["POST"])
def expression():
    data = request.get_json()

    expression = data.get("expression")
    confidence = data.get("confidence")

    print("Expression:", expression)
    print("Confidence:", confidence)

    expression_history.append({
        "expression": expression,
        "confidence": confidence
    })

    return jsonify({
        "status": "success",
        "message": "Expression received by backend"
    })


@app.route("/api/history")
def history():
    return jsonify({
        "status": "success",
        "history": expression_history
    })


if __name__ == "__main__":
    app.run(debug=True)