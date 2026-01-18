class Card:
    def __init__(self, name, problemType, problem, quest, reward):
        self.name = name
        self.problemType = problemType
        self.problem = problem
        self.quest = quest
        self.reward = reward

    def to_dict(self):
        return {
            "name": self.name,
            "problemType": self.problemType,
            # If problem is an object, we might want just its ID or summary
            "problem_id": self.problem.id if hasattr(self.problem, 'id') else str(self.problem),
            "quest": self.quest,
            "reward": self.reward
        }