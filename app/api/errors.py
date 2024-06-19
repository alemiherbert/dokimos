from app.api import api
from flask import jsonify
from werkzeug.exceptions import HTTPException
from werkzeug.http import HTTP_STATUS_CODES


def error_response(status_code, message=None):
    payload = {
        "error": HTTP_STATUS_CODES.get(status_code, 'Unknown error'),
        "code": status_code
    }
    if message:
        payload["message"] = message
    return jsonify(payload), status_code


@api.errorhandler(HTTPException)
def handle_exception(e):
    return error_response(e.code)
