from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/test")
def test():
    category = request.args.get("category")
    location = request.args.get("location")
    return {"category": category, "location": location}


if __name__ == "__main__":
    app.run(debug=True, port=5001)
