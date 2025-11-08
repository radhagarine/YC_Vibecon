#!/usr/bin/env python3
"""
Test session expiry handling
"""

import requests
import subprocess
import time
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv('/app/frontend/.env')

BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://smart-reception-4.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def test_expired_session():
    """Test that expired sessions are properly handled"""
    print("=== Testing Expired Session Handling ===")
    
    timestamp = int(time.time())
    user_id = f"test-user-expired-{timestamp}"
    session_token = f"test_session_expired_{timestamp}"
    email = f"test.expired.{timestamp}@example.com"
    
    # Create user and expired session (expired 1 hour ago)
    mongo_script = f"""
    use('test_database');
    var userId = '{user_id}';
    var sessionToken = '{session_token}';
    var email = '{email}';
    
    // Insert user
    db.users.insertOne({{
        _id: userId,
        email: email,
        name: 'Test Expired User',
        picture: 'https://via.placeholder.com/150',
        created_at: new Date()
    }});
    
    // Insert expired session (1 hour ago)
    db.user_sessions.insertOne({{
        user_id: userId,
        session_token: sessionToken,
        expires_at: new Date(Date.now() - 60*60*1000),  // 1 hour ago
        created_at: new Date()
    }});
    
    print('Created expired session test data');
    """
    
    try:
        # Create expired session
        result = subprocess.run(
            ['mongosh', '--eval', mongo_script],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode != 0:
            print(f"❌ Failed to create expired session test data: {result.stderr}")
            return False
        
        print("✅ Created expired session test data")
        
        # Try to use expired session
        response = requests.get(
            f"{API_BASE}/auth/me",
            headers={"Authorization": f"Bearer {session_token}"},
            timeout=10
        )
        
        if response.status_code == 401:
            print("✅ Expired session correctly rejected with 401")
            
            # Verify session was deleted from database
            check_script = f"""
            use('test_database');
            var count = db.user_sessions.countDocuments({{session_token: '{session_token}'}});
            print('Sessions remaining: ' + count);
            """
            
            check_result = subprocess.run(
                ['mongosh', '--eval', check_script],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if "Sessions remaining: 0" in check_result.stdout:
                print("✅ Expired session was automatically deleted from database")
            else:
                print("❌ Expired session was not deleted from database")
            
        else:
            print(f"❌ Expected 401 for expired session, got {response.status_code}")
            return False
        
        # Cleanup
        cleanup_script = f"""
        use('test_database');
        db.users.deleteOne({{_id: '{user_id}'}});
        db.user_sessions.deleteMany({{session_token: '{session_token}'}});
        print('Cleaned up expired session test data');
        """
        
        subprocess.run(['mongosh', '--eval', cleanup_script], timeout=30)
        print("✅ Cleaned up expired session test data")
        
        return True
        
    except Exception as e:
        print(f"❌ Exception during expired session test: {e}")
        return False

if __name__ == "__main__":
    success = test_expired_session()
    if success:
        print("\n🎉 Session expiry test PASSED")
    else:
        print("\n💥 Session expiry test FAILED")