class Player:
    def __init__(self, name, id):
        self.name = name
        self.id = id
        self.hand = []
        self.current_card = None # The card currently being played
        self.time_remaining = 0
        self.isAlive = True

    def select_card(self, card_index):
        if 0 <= card_index < len(self.hand):
            self.current_card = self.hand.pop(card_index)
            return self.current_card
        return None

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.name,
            "time_remaining": self.time_remaining,
            "isAlive": self.isAlive,
            # Don't send full hand to everyone if we want hidden hands, but for now send all
            "hand_count": len(self.hand) 
        }
