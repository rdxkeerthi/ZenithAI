"""
Test Games Integration
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_game_list():
    """Test that all games are defined"""
    print("🧪 Testing Game List...")
    
    expected_games = [
        'breath_sync',
        'focus_maze',
        'eye_control',
        'balance',
        'reaction',
        'memory',
        'calm_click',
        'relax_flow'
    ]
    
    frontend_games_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'games')
    
    if not os.path.exists(frontend_games_dir):
        print(f"⚠️  Frontend games directory not found: {frontend_games_dir}")
        return
    
    game_files = os.listdir(frontend_games_dir)
    
    for game in expected_games:
        game_file = f"game{expected_games.index(game) + 1}_{game}.jsx"
        if game_file in game_files:
            print(f"✅ Found {game_file}")
        else:
            print(f"❌ Missing {game_file}")
    
    print(f"\n✅ Total games found: {len([f for f in game_files if f.endswith('.jsx')])}/8")

def test_backend_games_api():
    """Test backend games API"""
    print("\n🧪 Testing Backend Games API...")
    
    from backend.routes.games import ALL_GAMES
    
    print(f"✅ Backend has {len(ALL_GAMES)} games defined")
    
    for game in ALL_GAMES:
        print(f"  - {game['name']}: {game['description']}")
    
    assert len(ALL_GAMES) == 8, "Should have 8 games"
    print("\n✅ Backend games API test passed!")

if __name__ == "__main__":
    print("=" * 60)
    print("StressGuardAI - Games Tests")
    print("=" * 60 + "\n")
    
    test_game_list()
    test_backend_games_api()
    
    print("\n" + "=" * 60)
    print("Tests completed!")
    print("=" * 60)
