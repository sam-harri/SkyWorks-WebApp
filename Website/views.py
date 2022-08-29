from urllib import request
from flask import Blueprint, render_template, url_for
import os

views = Blueprint('views', __name__)

@views.route('/', methods=['GET', 'POST'])
@views.route('/home', methods=['GET', 'POST'])
def home():
    return render_template('home.html', boolean=True)

@views.route('/tool1', methods=['GET', 'POST'])
def tool1():
    return render_template('tool1.html')

@views.route('/tool2', methods=['GET', 'POST'])
def tool2():
    return render_template('tool2.html')

@views.route('/tool3', methods=['GET', 'POST'])
def tool3():
    return render_template('tool3.html')