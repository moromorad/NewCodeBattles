import socketio
import asyncio
import sys

# Create a Socket.IO client
sio = socketio.AsyncClient()

# ----------------- Socket Events -----------------
@sio.event
async def connect():
    print("\n>>> Connected using websocket!")
    print(">>> Type 'join <name>' to start.")

@sio.event
async def connect_error(data):
    print(f"\n>>> Connection failed: {data}")

@sio.event
async def disconnect():
    print("\n>>> Disconnected from server")

@sio.event
async def game_joined(data):
    try:
        print("\n" + "="*30)
        print(f"GAME JOINED! Room: {data['room']}")
        print(f"Your Player ID: {data['player_id']}")
        # Debug: Print raw hand to see structure
        # print("DEBUG HAND DATA:", data['hand']) 
        
        print("YOUR HAND:")
        for idx, card in enumerate(data['hand']):
            # Safe access with defaults to prevent crashes
            name = card.get('name', 'Unknown')
            p_type = card.get('problemType', 'Unknown')
            quest = card.get('quest', 'None')
            print(f"  [{idx}] {name} ({p_type}) - Quest: {quest}")
            
        print("="*30)
        print(">>> Type 'play <index>' to play a card.")
    except Exception as e:
        print(f"ERROR inside game_joined: {e}")
        import traceback
        traceback.print_exc()

@sio.event
async def player_joined(data):
    print(f"\n>>> Player {data['username']} joined the room.")

@sio.event
async def card_played(data):
    card = data['card']
    problem = data['problem']
    print("\n" + "*"*30)
    print(f"CARD PLAYED: {card['name']}")
    print(f"PROBLEM: {card['name']}")
    print("-" * 20)
    print(problem['description'])
    print("-" * 20)
    print(">>> Type 'submit <code>' to solve it.")
    print("    Example: submit def solve(a, b): return a + b")

@sio.event
async def submission_result(data):
    print("\n" + "-"*30)
    if data['success']:
        print("✅ SUCCESS! Code passed.")
        print(f"Reward: {data['rewards']}")
        print(f"Time Remaining: {data['time_remaining']}")
        print("NEW HAND:")
        for idx, card in enumerate(data['new_hand']):
            print(f"  [{idx}] {card['name']}")
        print(">>> Type 'play <index>' to continue.")
    else:
        print("❌ FAILED!")
        if 'error' in data:
            print(f"Error: {data['error']}")
        elif 'results' in data:
            for res in data['results']:
                status = "PASS" if res['passed'] else "FAIL"
                print(f"  Test {res['test']}: {status} | Input: {res['input']} | Expected: {res['expected']} | Got: {res['output']}")
        print(">>> Try 'submit <code>' again.")

@sio.event
async def game_update(data):
    # Optional: Print raw state updates if needed
    # print(f"\n[Game State Update]: {data}")
    pass

@sio.event
async def error(data):
    print(f"\n>>> ERROR: {data['message']}")

# ----------------- Input Loop -----------------
async def user_input_loop():
    while True:
        try:
            # Async input is tricky in Python, using run_in_executor to avoid blocking loop
            loop = asyncio.get_running_loop()
            line = await loop.run_in_executor(None, sys.stdin.readline)
            if not line:
                break
            
            line = line.strip()
            parts = line.split(' ', 1)
            cmd = parts[0].lower()
            args = parts[1] if len(parts) > 1 else ""

            if cmd == 'exit':
                await sio.disconnect()
                break
            
            elif cmd == 'join':
                # usage: join MyName
                username = args if args else "Player1"
                await sio.emit('join_game', {'username': username, 'room': 'lobby1'})
            
            elif cmd == 'play':
                # usage: play 0
                try:
                    idx = int(args)
                    await sio.emit('play_card', {'card_index': idx})
                except ValueError:
                    print("Usage: play <card_index> (e.g., play 0)")

            elif cmd == 'submit':
                # usage: submit def solve....
                # To make it easier for multi-line, we might replace literal "\n" with newlines
                code = args.replace(r'\n', '\n') 
                await sio.emit('submit_code', {'code': code})

            else:
                if line:
                    print("Unknown command. Try: join, play, submit, exit")

        except KeyboardInterrupt:
            break

async def main():
    try:
        # Default to localhost, but allow arg: python interactive_client.py http://192.168.1.5:3000
        server_url = 'http://localhost:3000'
        if len(sys.argv) > 1:
            server_url = sys.argv[1]
            
        print(f"Connecting to {server_url}...")
        await sio.connect(server_url)
        # Start the input loop
        await user_input_loop()
    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        await sio.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
