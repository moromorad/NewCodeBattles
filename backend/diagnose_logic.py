import sys
import json
try:
    from src.game.CardGenerator import generate_hand
    
    print("Generating hand...")
    hand = generate_hand(5)
    print(f"Generated {len(hand)} cards.")
    
    for i, card in enumerate(hand):
        print(f"Card {i}: {card.name}")
        data = card.to_dict()
        print(f"Serialized: {json.dumps(data)}")
        
        # Check required fields
        if 'problemType' not in data:
            print("ERROR: Missing problemType")
        if 'name' not in data:
            print("ERROR: Missing name")
            
    print("Diagnostic passed!")
except Exception as e:
    print(f"Diagnostic FAILED: {e}")
    import traceback
    traceback.print_exc()
