from flask import request, redirect, Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_user import UserMixin
from flask_cors import CORS

import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender_email = ""
password_email = ""

from privateKeyGenerator import user, gen_QR_code


# Class-based application configuration
class ConfigClass(object):
    """ Flask application config """

    # Flask settings
    SECRET_KEY = 'This is an INSECURE secret!! DO NOT use this in production!!'

    # Flask-SQLAlchemy settings
    SQLALCHEMY_DATABASE_URI = 'sqlite:///users.sqlite'    # File-based SQL database
    SQLALCHEMY_TRACK_MODIFICATIONS = False    # Avoids SQLAlchemy warning


def create_app():
    """ Flask application factory """
    
    # Create Flask app load app.config
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(__name__+'.ConfigClass')

    # Initialize Flask-SQLAlchemy
    db = SQLAlchemy(app)

    # Define the User data-model.
    # NB: Make sure to add flask_user UserMixin !!!
    class User(db.Model, UserMixin):
        __tablename__ = 'users'
        id = db.Column(db.Integer, primary_key=True)

        # User authentication information. The collation='NOCASE' is required
        # to search case insensitively when USER_IFIND_MODE is 'nocase_collation'.
        email = db.Column(db.String(255, collation='NOCASE'), nullable=False, unique=True)
        userhash = db.Column(db.String(64), nullable=False, unique=True)

        # User information
        fname = db.Column(db.String(100, collation='NOCASE'), nullable=False, server_default='')
        gname = db.Column(db.String(100, collation='NOCASE'), nullable=False, server_default='')

    # Create all database tables
    db.create_all()

    # The Home page is accessible to anyone
    @app.route('/register', methods=['POST'])
    def register():
        fname = request.form.get('fname')
        gname = request.form.get('gname')
        email = request.form.get('email')

        print(request.form)

        tbzUser = user(fname, gname, email)
        js_user, private_key = tbzUser.gen_jason()
 
        if not User.query.filter(User.email == email).first():
            sqlUser = User(
            	email=email,
            	fname=fname,
				gname=gname,
				userhash=private_key
        	)
            db.session.add(sqlUser)
            db.session.commit()
            qrcode = gen_QR_code(private_key)
            qrcode_str = str(qrcode)[2:][:-2]

            message = MIMEMultipart("alternative")
            message["Subject"] = "login data"
            message["From"] = sender_email
            message["To"] = email

            html = ""
            html += f"<p>This is your private token to login: {private_key} </p>"
            html += f"<img src='data:image/jpeg;base64,{qrcode_str}' alt='qrcode'/>"

            message.attach(MIMEText(html, "html"))

            context = ssl.create_default_context()
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
                        server.login(sender_email, password_email)
                        server.sendmail(
                        sender_email, email, message.as_string()
                        )

            return jsonify(
                hash=private_key,
                qrcode=qrcode_str,
                jsUser=js_user
            )

        else:
            return jsonify(message="User already exists!")

    @app.route('/login', methods=['POST'])
    def login():
        userhash = request.get_json()['hash']
        print(userhash)

        if not User.query.filter(User.userhash == userhash).first():
            return jsonify(message='User Not Found') # register homepage
            #return redirect('http://localhost:3000/')

        return jsonify(message='Success')
        #return redirect('http://localhost:3000/bezahlen')

    return app


# Start development web server
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)