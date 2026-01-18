import time
from src.game.CardGenerator import generate_hand

class GameState:
    def __init__(self):
        self.players = []
        self.started = False
        self.game_over = False
        self.start_time = 0
        self.INITIAL_TIME = 300 # 5 minutes

    def add_player(self, player):
        self.players.append(player)
        # Initialize player state
        player.time_remaining = self.INITIAL_TIME
        player.hand = generate_hand(5)

    def start_game(self):
        self.started = True
        self.start_time = time.time()
        # In a real loop, we'd have a tick function. 
        # For now, we calculate time_remaining on demand or via client heartbeats.

    def get_state(self):
        return {
            "started": self.started,
            "game_over": self.game_over,
            "players": [p.to_dict() for p in self.players]
        }