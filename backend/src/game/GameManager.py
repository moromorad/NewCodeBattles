import asyncio
import uuid
from src.game.GameState import GameState
from src.game.Player import Player

class GameManager:
    def __init__(self):
        self.games = {}  # game_id -> GameState
        self.players = {}  # sid -> player_id
        self.player_game_map = {}  # sid -> game_id

    def create_game(self, game_id=None):
        if not game_id:
            game_id = str(uuid.uuid4())[:8]
        
        # Avoid overwriting existing games if ID passed
        if game_id not in self.games:
            self.games[game_id] = GameState()
            
        return game_id

    def join_game(self, game_id, sid, player_name):
        if game_id not in self.games:
            return None
        
        game = self.games[game_id]
        player_id = str(uuid.uuid4())
        new_player = Player(player_name, player_id)
        
        game.players.append(new_player)
        self.players[sid] = player_id
        self.player_game_map[sid] = game_id
        
        return new_player

    def get_game_by_sid(self, sid):
        game_id = self.player_game_map.get(sid)
        if game_id:
            return self.games.get(game_id)
        return None

    def remove_player(self, sid):
        if sid in self.player_game_map:
            game_id = self.player_game_map[sid]
            del self.player_game_map[sid]
            # Ideally remove from game.players too, but simple for now

game_manager = GameManager()
