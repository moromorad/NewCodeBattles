from src.game.Card import Card
from src.game import ProblemBank

def generate_hand(count=5):
    import random
    problems = [ProblemBank.SumTwoNumsProblem, ProblemBank.ReverseStringProblem, ProblemBank.FactorialProblem]
    hand = []
    for _ in range(count):
        prob = random.choice(problems)
        # Card(name, problemType, problem, quest, reward)
        # Note: 'problem' arg in Card seems to imply the Problem object or ID. Using ID for now.
        card = Card(
            name=f"{prob.name} Card",
            problemType=prob.problemType,
            problem=prob.id, # Storing the ID of the problem
            quest=prob.quest,
            reward=prob.reward
        )
        hand.append(card)
    return hand

def get_problem_details(problem_id):
    return {
        "description": problem_id.setup,
        "test_cases": problem_id.testCases
    }