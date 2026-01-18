from src.game.Card import Card
from src.game.ProblemBank.SumTwoNumsProblem import AbstractProblem as SumTwoNumsProblem
from src.game.ProblemBank.ReverseStringProblem import AbstractProblem as ReverseStringProblem
from src.game.ProblemBank.Factorial import AbstractProblem as FactorialProblem

def generate_hand(count=5):
    import random
    problems = [SumTwoNumsProblem, ReverseStringProblem, FactorialProblem]
    hand = []
    for _ in range(count):
        prob = random.choice(problems)
        # Card(name, problemType, problem, quest, reward)
        # Note: 'problem' arg in Card seems to imply the Problem object or ID. Using ID for now.
        card = Card(
            name=f"{prob.name} Card",
            problemType=prob.problemType,
            problem=prob, # Storing the whole object
            quest=prob.quest,
            reward=prob.reward
        )
        hand.append(card)
    return hand

def get_problem_details(problem_id):
    return {
        "description": problem_id.description,
        "test_cases": problem_id.testCases
    }