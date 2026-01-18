import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI()

# Input CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# Simple Health Check
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Socket.IO Events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

from src.game.GameManager import game_manager
from src.game.CardGenerator import get_problem_details, generate_hand
from src.game.FunctionTester import run_user_function

@sio.event
async def join_game(sid, data):
    # expect data = { 'room': 'room_id', 'username': 'name' }
    room = data.get('room')
    username = data.get('username')
    
    # If room provided but doesn't exist, create it (Auto-create lobby)
    if room and room not in game_manager.games:
        game_manager.create_game(room)
    
    if not room:
        room = game_manager.create_game()
    
    player = game_manager.join_game(room, sid, username)
    if player:
        await sio.enter_room(sid, room)
        # Send initial state
        game = game_manager.games[room]
        
        # Notify this player
        await sio.emit('game_joined', {
            'room': room, 
            'player_id': player.id,
            'hand': [c.to_dict() for c in player.hand]
        }, to=sid)
        
        # Notify others
        await sio.emit('player_joined', {'username': username}, room=room)
    else:
        await sio.emit('error', {'message': 'Game not found'}, to=sid)

@sio.event
async def play_card(sid, data):
    # data = { 'card_index': 0 }
    game = game_manager.get_game_by_sid(sid)
    if not game: return
    
    # Find player object (need a helper in GameManager ideally, but iterating for now or using sid map)
    # GameManager has player_game_map but updates to game.players are by ref.
    # We need to find the specific Player object.
    # We can optimize GameManager later to map sid -> Player object directly.
    # For now, let's look up player by ID if we track it, or iterate game.players
    player_id = game_manager.players.get(sid)
    player = next((p for p in game.players if p.id == player_id), None)
    
    if not player: return

    card_index = data.get('card_index')
    card = player.select_card(card_index)
    
    if card:
        # Fetch problem details
        prob_details = get_problem_details(card.problem.id)
        
        await sio.emit('card_played', {
            'card': card.to_dict(),
            'problem': prob_details
        }, to=sid)
        
        # Notify others (optional, maybe just "Player X played a card")
        await sio.emit('opponent_action', {
            'player_id': player.id,
            'action': 'played_card'
        }, room=game_manager.player_game_map[sid], skip_sid=sid)

@sio.event
async def submit_code(sid, data):
    # data = { 'code': '...' }
    game = game_manager.get_game_by_sid(sid)
    if not game: return

    player_id = game_manager.players.get(sid)
    player = next((p for p in game.players if p.id == player_id), None)
    
    if not player or not player.current_card:
        await sio.emit('submission_result', {'success': False, 'message': 'No active card'}, to=sid)
        return

    user_code = data.get('code')
    problem_id = player.current_card.problem.id
    prob_details = get_problem_details(problem_id)
    
    if not prob_details:
        await sio.emit('error', {'message': 'Problem not found'}, to=sid)
        return

    # Run tests
    # We need to know the expected function name. 
    # For now, let's assume 'solve' or parse it from description/problem.
    # CardGenerator could store "function_name" in problem details.
    # Hardcoding 'solve' for this prototype based on current descriptions.
    results = run_user_function(user_code, 'solve', prob_details['test_cases'])
    
    passed_all = all(r.get('passed', False) for r in results)
    
    if passed_all:
        # Success Logic
        reward_type = player.current_card.reward
        
        if reward_type == 'ADD_TIME_30':
            player.time_remaining += 30
        elif reward_type == 'BUFF_SELF':
            player.time_remaining += 60
        elif reward_type == 'DEBUFF_OTHERS':
            # reduce others time
            for p in game.players:
                if p.id != player.id:
                    p.time_remaining -= 30
        
        # Clear current card and draw new one
        player.current_card = None
        new_cards = generate_hand(1) # Draw 1
        player.hand.extend(new_cards)
        
        await sio.emit('submission_result', {
            'success': True, 
            'results': results,
            'rewards': reward_type,
            'new_hand': [c.to_dict() for c in player.hand],
            'time_remaining': player.time_remaining
        }, to=sid)
        
        # Broadcast state update
        await sio.emit('game_update', game.get_state(), room=game_manager.player_game_map[sid])
        
    else:
        await sio.emit('submission_result', {
            'success': False, 
            'results': results
        }, to=sid)

if __name__ == "__main__":
    import uvicorn
    # While developing, running via `uvicorn src.main:socket_app --reload` is preferred
    uvicorn.run("src.main:socket_app", host="0.0.0.0", port=3000, reload=True)
