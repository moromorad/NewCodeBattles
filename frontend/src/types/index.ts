export interface Problem {
    id: string;
    description: string;
    setup: string; // Formatting setup code
}

export interface Card {
    name: string;
    problemType: 'easy' | 'medium' | 'hard' | 'legendary';
    problem_id: string;
    quest: string;
    reward: string;
}

export interface Player {
    id: string; // Socket ID
    username: string;
    hand: Card[];
    time_remaining: number; # Seconds
is_alive: boolean;
}

export interface GameState {
    game_id: string;
    players: { [sid: string]: Player };
    started: boolean;
    start_time: number;
}


// Socket Event Payloads
export interface JoinGamePayload {
    username: string;
    room?: string;
}

export interface GameJoinedPayload {
    room: string;
    player_id: string;
    hand: Card[];
}
