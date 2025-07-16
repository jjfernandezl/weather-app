from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
from config import config, Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app(config_name='default'):
    """Application factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS for all routes
    CORS(app)
    
    # Validate configuration
    try:
        Config.validate_config()
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        return None
    
    @app.route('/', methods=['GET'])
    def health_check():
        """Health check endpoint."""
        return jsonify({
            'status': 'healthy',
            'service': 'weather-api',
            'version': '1.0.0'
        })
    
    @app.route('/weather', methods=['POST'])
    def get_weather():
        """Get weather data for a location."""
        try:
            # Get location from request
            data = request.get_json()
            if not data or 'location' not in data:
                return jsonify({
                    'error': 'Location is required',
                    'message': 'Please provide a location in the request body'
                }), 400
            
            location = data['location'].strip()
            if not location:
                return jsonify({
                    'error': 'Invalid location',
                    'message': 'Location cannot be empty'
                }), 400
            
            # Call OpenWeatherMap API
            weather_data = fetch_weather_data(location)
            
            if weather_data is None:
                return jsonify({
                    'error': 'Weather data not found',
                    'message': f'Could not find weather data for {location}'
                }), 404
            
            return jsonify(weather_data)
            
        except Exception as e:
            logger.error(f"Error getting weather: {e}")
            return jsonify({
                'error': 'Internal server error',
                'message': 'An error occurred while fetching weather data'
            }), 500
    
    def fetch_weather_data(location):
        """Fetch weather data from OpenWeatherMap API."""
        try:
            # Construct API URL
            url = f"{Config.OPENWEATHER_BASE_URL}/weather"
            params = {
                'q': location,
                'appid': Config.OPENWEATHER_API_KEY,
                'units': Config.DEFAULT_UNITS
            }
            
            # Make API request
            response = requests.get(
                url, 
                params=params, 
                timeout=Config.REQUEST_TIMEOUT
            )
            
            if response.status_code == 404:
                return None
            
            response.raise_for_status()
            data = response.json()
            
            # Extract relevant data
            return {
                'location': data['name'],
                'country': data['sys']['country'],
                'temperature': f"{data['main']['temp']}°C",
                'description': data['weather'][0]['description'].title(),
                'humidity': f"{data['main']['humidity']}%",
                'wind_speed': f"{data['wind']['speed']} m/s",
                'timestamp': data['dt']
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return None
        except KeyError as e:
            logger.error(f"Unexpected API response structure: {e}")
            return None
    
    return app

if __name__ == '__main__':
    app = create_app('development')
    if app:
        app.run(
            host=Config.HOST,
            port=Config.PORT,
            debug=Config.DEBUG
        )
    else:
        logger.error("Failed to create application")
