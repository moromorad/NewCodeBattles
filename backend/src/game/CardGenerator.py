from src.game.Card import Card
from src.game.ProblemBank.AbstractProblem import AbstractProblem

# Dummy Problems
problems = [
    AbstractProblem(
        name="Sum Two Numbers",
        problemType="easy",
        id="sum_two",
        quest="Complete in under 10 chars (Not enforced yet)",
        reward="ADD_TIME_30"
    ),
    AbstractProblem(
        name="Reverse String",
        problemType="easy", 
        id="rev_str", 
        quest="No quest", 
        reward="BUFF_SELF"
    ),
    AbstractProblem(
        name="Factorial",
        problemType="medium", 
        id="fact", 
        quest="Don't use recursion", 
        reward="DEBUFF_OTHERS"
    )
]

# Hardcoded test cases for now
PROBLEM_TEST_CASES = {
    "sum_two": [((1, 2), 3), ((-1, -1), -2)],
    "rev_str": [(("hello",), "olleh"), (("abc",), "cba")],
    "fact": [((5,), 120), ((3,), 6)]
}

PROBLEM_DESCRIPTIONS = {
    "sum_two": "def solve(a, b):\n    # Return the sum of a and b\n    pass",
    "rev_str": "def solve(s):\n    # Return the reversed string\n    pass",
    "fact": "def solve(n):\n    # Return n factorial\n    pass"
}

def generate_hand(count=5):
    import random
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
        "description": PROBLEM_DESCRIPTIONS.get(problem_id, ""),
        "test_cases": PROBLEM_TEST_CASES.get(problem_id, [])
    }