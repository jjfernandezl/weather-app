import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration class."""
    
    # OpenWeatherMap API configuration
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
    OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'
    
    # Flask configuration
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')
    
    # API configuration
    DEFAULT_UNITS = 'metric'  # Celsius, m/s, etc.
    REQUEST_TIMEOUT = 10  # seconds
    
    @staticmethod
    def validate_config():
        """Validate that required configuration is present."""
        if not Config.OPENWEATHER_API_KEY:
            raise ValueError("OPENWEATHER_API_KEY environment variable is required")
        return True

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
