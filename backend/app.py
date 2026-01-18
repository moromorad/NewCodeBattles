import os
from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO with CORS enabled
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading'
)

# In-memory game state (no database needed)
game_state = {
    'players': {}
}

@app.route('/')
def index():
    return {'status': 'CodeBattles Server Running', 'players': len(game_state['players'])}

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    # Send current game state to newly connected client
    emit('game_state', game_state)

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')

@socketio.on('player_move')
def handle_player_move(data):
    """Handle player position updates from any client"""
    player_id = data.get('playerId')
    position = data.get('position')
    
    if player_id and position:
        # Update game state
        if player_id not in game_state['players']:
            game_state['players'][player_id] = {'id': player_id}
        
        game_state['players'][player_id]['position'] = position
        
        # Broadcast to all other clients (excluding sender)
        emit('player_move', {
            'playerId': player_id,
            'position': position
        }, broadcast=True, include_self=True)
        
        print(f'Player {player_id} moved to {position}')

@socketio.on('player_action')
def handle_player_action(data):
    """Handle player action from any client"""
    player_id = data.get('playerId')
    action = data.get('action')
    
    if player_id and action:
        # Update game state
        if player_id not in game_state['players']:
            game_state['players'][player_id] = {'id': player_id}
        
        game_state['players'][player_id]['action'] = action
        
        # Broadcast to all other clients (including sender)
        emit('player_action', {
            'playerId': player_id,
            'action': action
        }, broadcast=True, include_self=True)
        
        print(f'Player {player_id} performed action: {action}')

@socketio.on('get_game_state')
def handle_get_game_state():
    """Send current game state to requesting client"""
    emit('game_state', game_state)

@socketio.on('test_message')
def handle_test_message(data):
    """Handle test messages for connection testing between computers"""
    from_name = data.get('from', 'Unknown')
    message = data.get('message', '')
    
    if message:
        # Broadcast to all clients (including sender)
        emit('test_message', {
            'from': from_name,
            'message': message
        }, broadcast=True, include_self=True)
        
        print(f'Test message from {from_name}: {message}')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    print(f'Starting server on {host}:{port}')
    print(f'Connect frontend to: http://localhost:{port}')
    print(f'For ngrok: Use the ngrok URL when running ngrok http {port}')
    
    socketio.run(app, host=host, port=port, debug=True, allow_unsafe_werkzeug=True)