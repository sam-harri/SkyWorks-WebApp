from flask import Blueprint, render_template, url_for


views = Blueprint('views', __name__)

@views.route('/')
@views.route('/home', methods=['GET', 'POST'])
def home():
    return render_template('home.html', boolean=True)

@views.route('/tool1', methods=['GET', 'POST'])
def tool1():
    return render_template('tool1.html')