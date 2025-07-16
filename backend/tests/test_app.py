import pytest
import json
from app import create_app

@pytest.fixture
def client():
    """Create test client."""
    app = create_app('development')
    if app is None:
        pytest.skip("Cannot create app - check configuration")
    
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test health check endpoint."""
    response = client.get('/')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert data['service'] == 'weather-api'

def test_weather_missing_location(client):
    """Test weather endpoint with missing location."""
    response = client.post('/weather', json={})
    assert response.status_code == 400
    
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Location is required'

def test_weather_empty_location(client):
    """Test weather endpoint with empty location."""
    response = client.post('/weather', json={'location': ''})
    assert response.status_code == 400
    
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Invalid location'

def test_weather_invalid_json(client):
    """Test weather endpoint with invalid JSON."""
    response = client.post('/weather', data='invalid json')
    assert response.status_code == 400
