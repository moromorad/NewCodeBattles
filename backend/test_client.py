import socketio
import asyncio

sio = socketio.AsyncClient()

@sio.event
async def connect():
    print("Connected!")
    # Join game
    await sio.emit('join_game', {'username': 'Tester', 'room': 'test_room'})

@sio.event
async def game_joined(data):
    print("Game Joined:", data)
    # Play first card
    await sio.emit('play_card', {'card_index': 0})

@sio.event
async def card_played(data):
    print("Card Played:", data)
    # Submit correct code for "sum_two" (assuming it's the easy one)
    # If random card is different, this might fail, but for testing we check logs.
    # Let's try to submit generic code if problem is generic.
    
    # Check problem ID
    if data['card']['problem_id'] == 'sum_two':
        code = "def solve(a, b): return a + b"
    elif data['card']['problem_id'] == 'rev_str':
        code = "def solve(s): return s[::-1]"
    elif data['card']['problem_id'] == 'fact':
        code = "def solve(n): return 1 if n <= 1 else n * solve(n-1)"
    else:
        code = "def solve(*args): return 0"
        
    print(f"Submitting code for {data['card']['problem_id']}...")
    await sio.emit('submit_code', {'code': code})

@sio.event
async def submission_result(data):
    print("Submission Result:", data)
    if data['success']:
        print("SUCCESS! Hand updated.")
        await sio.disconnect()
    else:
        print("FAILED!")
        await sio.disconnect()

async def main():
    await sio.connect('http://localhost:3000')
    await sio.wait()

if __name__ == '__main__':
    asyncio.run(main())
