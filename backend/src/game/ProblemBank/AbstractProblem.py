class AbstractProblem:
    def __init__(self, name, problemType, id, quest, reward):
        self.name = name
        self.id = id
        self.problemType = problemType
        self.quest = quest
        self.reward = reward