from marshmallow import Schema,fields,validate,ValidationError,validates
from datetime import date
from werkzeug.security import generate_password_hash

class UserLoginSchema(Schema):
    username = fields.String(required=True)
    password = fields.String(required=True)

class LoginResponseSchema(Schema):
    message = fields.String(required=True)
    access_token = fields.String(required=True)
    role = fields.String(required=True)


class PasswordField(fields.Field):
    """Custom Marshmallow field that hashes password on load."""
    
    def _deserialize(self, value, attr, data, **kwargs):
        if not value or len(value) < 3:
            raise ValueError("Password must be at least 6 characters long")
        return generate_password_hash(value)



class UserRegisterSchema(Schema):
    username = fields.String(required=True,validate=validate.Length(min=3, max=50))
    password = PasswordField(required=True, load_only=True)
    name = fields.String(required=True)
    lastname = fields.String(required=True)
    dateOfBirth = fields.DateTime(required=True, format="%Y-%m-%d")
    gender = fields.String(required=True)
    country = fields.String(required=True)
    street = fields.String(required=True)
    streetNumber = fields.Integer(required=True, validate=validate.Range(min = 1))
    accountBalance = fields.Float(required=True, validate=validate.Range(min = 0))

class GetUsersSchema(Schema):
    id = fields.Integer(required=True)
    username = fields.String(required=True)
    role = fields.String(required=True)

class UpdateUserRoleSchema(Schema):
    role = fields.String(required=True)

class EditUserResponseSchema(Schema):
    username = fields.String()
    name = fields.String()
    lastname = fields.String()
    dateOfBirth = fields.DateTime(format="%Y-%m-%d")
    gender = fields.String()
    country = fields.String()
    street = fields.String()
    streetNumber = fields.Integer()
    accountBalance = fields.Float()
    profile_image = fields.Method("get_profile_image_url")

    def get_profile_image_url(self,obj):
        if obj.profile_image:
            return f"/uploads/{obj.profile_image}"
        return None

