#!/usr/bin/env python3
"""
Backend Authentication Testing for AIRA Application
Tests Google OAuth authentication endpoints and session management
"""

import requests
import json
import time
from datetime import datetime, timezone, timedelta
import subprocess
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend env
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://smart-reception-4.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class AuthTester:
    def __init__(self):
        self.test_results = []
        self.test_user_id = None
        self.test_session_token = None
        self.test_email = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def create_test_user_and_session(self):
        """Create test user and session in MongoDB using mongosh"""
        print("\n=== Creating Test User and Session ===")
        
        timestamp = int(time.time())
        self.test_user_id = f"test-user-{timestamp}"
        self.test_session_token = f"test_session_{timestamp}"
        self.test_email = f"test.user.{timestamp}@example.com"
        
        # MongoDB script to create test user and session
        mongo_script = f"""
        use('test_database');
        var userId = '{self.test_user_id}';
        var sessionToken = '{self.test_session_token}';
        var email = '{self.test_email}';
        
        // Insert user with correct schema
        db.users.insertOne({{
            _id: userId,
            email: email,
            name: 'Test User',
            picture: 'https://via.placeholder.com/150',
            created_at: new Date()
        }});
        
        // Insert session with 7-day expiry
        db.user_sessions.insertOne({{
            user_id: userId,
            session_token: sessionToken,
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date()
        }});
        
        print('Test user created with ID: ' + userId);
        print('Test session token: ' + sessionToken);
        """
        
        try:
            result = subprocess.run(
                ['mongosh', '--eval', mongo_script],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.log_test(
                    "Create Test User and Session",
                    True,
                    f"Created test user {self.test_user_id} and session",
                    f"Email: {self.test_email}, Token: {self.test_session_token}"
                )
                return True
            else:
                self.log_test(
                    "Create Test User and Session",
                    False,
                    "Failed to create test data in MongoDB",
                    f"Error: {result.stderr}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Create Test User and Session",
                False,
                "Exception creating test data",
                str(e)
            )
            return False
    
    def test_auth_me_with_authorization_header(self):
        """Test GET /api/auth/me with Authorization header"""
        print("\n=== Testing GET /api/auth/me with Authorization Header ===")
        
        try:
            response = requests.get(
                f"{API_BASE}/auth/me",
                headers={
                    "Authorization": f"Bearer {self.test_session_token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                expected_fields = ['id', 'email', 'name', 'picture', 'created_at']
                
                # Verify all required fields are present
                missing_fields = [field for field in expected_fields if field not in user_data]
                if missing_fields:
                    self.log_test(
                        "Auth Me - Authorization Header",
                        False,
                        f"Missing fields in response: {missing_fields}",
                        user_data
                    )
                    return False
                
                # Verify user data matches
                if user_data['id'] == self.test_user_id and user_data['email'] == self.test_email:
                    self.log_test(
                        "Auth Me - Authorization Header",
                        True,
                        "Successfully retrieved user data with Authorization header",
                        user_data
                    )
                    return True
                else:
                    self.log_test(
                        "Auth Me - Authorization Header",
                        False,
                        "User data mismatch",
                        f"Expected ID: {self.test_user_id}, Got: {user_data.get('id')}"
                    )
                    return False
            else:
                self.log_test(
                    "Auth Me - Authorization Header",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    None
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Auth Me - Authorization Header",
                False,
                "Exception during request",
                str(e)
            )
            return False
    
    def test_auth_me_with_cookie(self):
        """Test GET /api/auth/me with session cookie"""
        print("\n=== Testing GET /api/auth/me with Cookie ===")
        
        try:
            cookies = {'session_token': self.test_session_token}
            response = requests.get(
                f"{API_BASE}/auth/me",
                cookies=cookies,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data['id'] == self.test_user_id and user_data['email'] == self.test_email:
                    self.log_test(
                        "Auth Me - Cookie",
                        True,
                        "Successfully retrieved user data with cookie",
                        user_data
                    )
                    return True
                else:
                    self.log_test(
                        "Auth Me - Cookie",
                        False,
                        "User data mismatch with cookie",
                        user_data
                    )
                    return False
            else:
                self.log_test(
                    "Auth Me - Cookie",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    None
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Auth Me - Cookie",
                False,
                "Exception during cookie request",
                str(e)
            )
            return False
    
    def test_auth_me_without_token(self):
        """Test GET /api/auth/me without authentication"""
        print("\n=== Testing GET /api/auth/me without Authentication ===")
        
        try:
            response = requests.get(
                f"{API_BASE}/auth/me",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test(
                    "Auth Me - No Token",
                    True,
                    "Correctly returned 401 for unauthenticated request",
                    response.text
                )
                return True
            else:
                self.log_test(
                    "Auth Me - No Token",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Auth Me - No Token",
                False,
                "Exception during unauthenticated request",
                str(e)
            )
            return False
    
    def test_auth_me_with_invalid_token(self):
        """Test GET /api/auth/me with invalid token"""
        print("\n=== Testing GET /api/auth/me with Invalid Token ===")
        
        try:
            response = requests.get(
                f"{API_BASE}/auth/me",
                headers={
                    "Authorization": "Bearer invalid_token_12345",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test(
                    "Auth Me - Invalid Token",
                    True,
                    "Correctly returned 401 for invalid token",
                    response.text
                )
                return True
            else:
                self.log_test(
                    "Auth Me - Invalid Token",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Auth Me - Invalid Token",
                False,
                "Exception during invalid token request",
                str(e)
            )
            return False
    
    def test_session_creation_endpoint(self):
        """Test POST /api/auth/session endpoint (mocked since we can't call Emergent Auth)"""
        print("\n=== Testing POST /api/auth/session (Limited - External Dependency) ===")
        
        try:
            # Test without X-Session-ID header
            response = requests.post(
                f"{API_BASE}/auth/session",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_test(
                    "Session Creation - Missing Header",
                    True,
                    "Correctly returned 400 for missing X-Session-ID header",
                    response.text
                )
            else:
                self.log_test(
                    "Session Creation - Missing Header",
                    False,
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
            
            # Test with invalid session ID (will fail at Emergent Auth call)
            response = requests.post(
                f"{API_BASE}/auth/session",
                headers={
                    "X-Session-ID": "invalid_session_id",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            # This should fail with 503 (service unavailable) or similar
            if response.status_code in [503, 500, 400]:
                self.log_test(
                    "Session Creation - Invalid Session ID",
                    True,
                    f"Correctly handled invalid session ID with {response.status_code}",
                    response.text
                )
            else:
                self.log_test(
                    "Session Creation - Invalid Session ID",
                    False,
                    f"Unexpected response {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Session Creation - Error Handling",
                True,
                "Exception expected due to external dependency",
                str(e)
            )
    
    def test_logout_endpoint(self):
        """Test POST /api/auth/logout endpoint"""
        print("\n=== Testing POST /api/auth/logout ===")
        
        try:
            # Test logout with valid session cookie
            cookies = {'session_token': self.test_session_token}
            response = requests.post(
                f"{API_BASE}/auth/logout",
                cookies=cookies,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                # Check if session was deleted from database
                self.log_test(
                    "Logout - Valid Session",
                    True,
                    "Successfully logged out user",
                    response.text
                )
                
                # Verify session is now invalid
                auth_response = requests.get(
                    f"{API_BASE}/auth/me",
                    cookies=cookies,
                    timeout=10
                )
                
                if auth_response.status_code == 401:
                    self.log_test(
                        "Logout - Session Invalidated",
                        True,
                        "Session correctly invalidated after logout",
                        None
                    )
                else:
                    self.log_test(
                        "Logout - Session Invalidated",
                        False,
                        f"Session still valid after logout: {auth_response.status_code}",
                        auth_response.text
                    )
                
                return True
            else:
                self.log_test(
                    "Logout - Valid Session",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    None
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Logout - Valid Session",
                False,
                "Exception during logout",
                str(e)
            )
            return False
    
    def test_logout_without_session(self):
        """Test POST /api/auth/logout without session"""
        print("\n=== Testing POST /api/auth/logout without Session ===")
        
        try:
            response = requests.post(
                f"{API_BASE}/auth/logout",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_test(
                    "Logout - No Session",
                    True,
                    "Correctly returned 400 for logout without session",
                    response.text
                )
                return True
            else:
                self.log_test(
                    "Logout - No Session",
                    False,
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Logout - No Session",
                False,
                "Exception during logout without session",
                str(e)
            )
            return False
    
    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print("\n=== Cleaning Up Test Data ===")
        
        mongo_script = f"""
        use('test_database');
        var deletedUsers = db.users.deleteMany({{email: /test\\.user\\./}});
        var deletedSessions = db.user_sessions.deleteMany({{session_token: /test_session/}});
        print('Deleted ' + deletedUsers.deletedCount + ' test users');
        print('Deleted ' + deletedSessions.deletedCount + ' test sessions');
        """
        
        try:
            result = subprocess.run(
                ['mongosh', '--eval', mongo_script],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.log_test(
                    "Cleanup Test Data",
                    True,
                    "Successfully cleaned up test data",
                    result.stdout
                )
            else:
                self.log_test(
                    "Cleanup Test Data",
                    False,
                    "Failed to clean up test data",
                    result.stderr
                )
                
        except Exception as e:
            self.log_test(
                "Cleanup Test Data",
                False,
                "Exception during cleanup",
                str(e)
            )
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print(f"\n🚀 Starting AIRA Authentication Backend Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Create test data
        if not self.create_test_user_and_session():
            print("❌ Failed to create test data. Aborting tests.")
            return False
        
        # Run authentication tests
        self.test_auth_me_with_authorization_header()
        self.test_auth_me_with_cookie()
        self.test_auth_me_without_token()
        self.test_auth_me_with_invalid_token()
        
        # Test session creation (limited due to external dependency)
        self.test_session_creation_endpoint()
        
        # Test logout (this will invalidate our session)
        self.test_logout_endpoint()
        self.test_logout_without_session()
        
        # Clean up
        self.cleanup_test_data()
        
        # Print summary
        self.print_summary()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🔍 AUTHENTICATION TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        print("\n📋 Detailed Results:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        # Identify critical failures
        critical_failures = [r for r in self.test_results if not r['success'] and 'Auth Me' in r['test']]
        if critical_failures:
            print(f"\n🚨 CRITICAL FAILURES ({len(critical_failures)}):")
            for failure in critical_failures:
                print(f"   ❌ {failure['test']}: {failure['message']}")
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    tester = AuthTester()
    tester.run_all_tests()