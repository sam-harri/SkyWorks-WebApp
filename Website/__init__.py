from flask import Flask

def createApp():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'fajaApp'
    
    from .views import views
    
    app.register_blueprint(views, url_prefix='/')
    
    return app