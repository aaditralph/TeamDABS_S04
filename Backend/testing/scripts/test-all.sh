#!/bin/bash

###############################################################################
# Genesis Backend - Complete Automated Test Suite
# Usage: ./test-all.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPLOAD_DIR="$SCRIPT_DIR/../uploads"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_step() {
    echo -e "${YELLOW}➜ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
}

print_fail() {
    echo -e "${RED}✗ $1${NC}"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
}

check_response() {
    local response="$1"
    local test_name="$2"
    
    if echo "$response" | grep -q '"success":true'; then
        print_success "$test_name"
        return 0
    else
        print_fail "$test_name: $response"
        return 1
    fi
}

extract_json_field() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"$field\":[^,}]*" | cut -d':' -f2 | tr -d '"' | tr -d ' ' | head -1
}

###############################################################################
# Setup Functions
###############################################################################

setup_directories() {
    print_step "Creating upload directories..."
    mkdir -p "$UPLOAD_DIR/officers"
    mkdir -p "$UPLOAD_DIR/verification"
    mkdir -p "$SCRIPT_DIR/../sample-data"
    print_success "Directories created"
}

create_test_files() {
    print_step "Creating test files..."
    
    # Create test document
    echo "Test ID Document for BMC Officer Verification" > "$SCRIPT_DIR/../sample-data/test_document.txt"
    
    # Create test images (using ImageMagick if available, else placeholder)
    if command -v convert &> /dev/null; then
        convert -size 200x200 xc:blue "$UPLOAD_DIR/verification/test-meter.jpg"
        convert -size 200x200 xc:green "$UPLOAD_DIR/verification/test-composter.jpg"
    else
        # Create placeholder files
        echo "JFIF" > "$UPLOAD_DIR/verification/test-meter.jpg"
        echo "JFIF" > "$UPLOAD_DIR/verification/test-composter.jpg"
    fi
    
    print_success "Test files created"
}

cleanup() {
    print_step "Cleaning up test data..."
    rm -f "$SCRIPT_DIR/../sample-data/test_document.txt"
    rm -f "$UPLOAD_DIR/verification/test-meter.jpg"
    rm -f "$UPLOAD_DIR/verification/test-composter.jpg"
    print_success "Cleanup complete"
}

###############################################################################
# Health Check
###############################################################################

test_health() {
    print_header "1. Health Check"
    
    local response=$(curl -s "$BASE_URL/health")
    
    if echo "$response" | grep -q '"status":"healthy"'; then
        print_success "Health check passed"
        echo "Response: $response"
    else
        print_fail "Health check failed: $response"
        exit 1
    fi
}

###############################################################################
# Admin Authentication Tests
###############################################################################

test_admin_auth() {
    print_header "2. Admin Authentication Tests"
    
    # Test Admin Login
    print_step "Testing Admin Login..."
    local response=$(curl -s -X POST "$BASE_URL/admin/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"DABS","password":"123"}')
    
    if echo "$response" | grep -q '"success":true'; then
        ADMIN_TOKEN=$(extract_json_field "$response" "token")
        print_success "Admin login successful"
        echo "Token: ${ADMIN_TOKEN:0:30}..."
    else
        print_fail "Admin login failed: $response"
        return 1
    fi
    
    # Test Get Pending Officers
    print_step "Testing Get Pending Officers..."
    response=$(curl -s "$BASE_URL/admin/pending-officers" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    check_response "$response" "Get pending officers"
    
    # Test Get Pending Societies
    print_step "Testing Get Pending Societies..."
    response=$(curl -s "$BASE_URL/admin/pending-societies" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    check_response "$response" "Get pending societies"
    
    # Test Get All Societies
    print_step "Testing Get All Societies..."
    response=$(curl -s "$BASE_URL/admin/societies" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    check_response "$response" "Get all societies"
}

###############################################################################
# BMC Officer Tests
###############################################################################

test_bmc_officer() {
    print_header "3. BMC Officer Tests"
    
    # Register Officer
    print_step "Registering BMC Officer..."
    response=$(curl -s -X POST "$BASE_URL/api/officer/register" \
        -F "name=Test Officer" \
        -F "email=testofficer@bmc.gov.in" \
        -F "password=password123" \
        -F "phone=9876543210" \
        -F "documentType=Aadhar" \
        -F "document=@$SCRIPT_DIR/../sample-data/test_document.txt")
    
    if echo "$response" | grep -q '"success":true'; then
        OFFICER_ID=$(extract_json_field "$response" "id")
        print_success "Officer registered: $OFFICER_ID"
    else
        # Officer might already exist, try to get ID
        print_step "Officer may already exist, continuing..."
    fi
    
    # Admin Approves Officer
    print_step "Admin approving officer..."
    response=$(curl -s -X PUT "$BASE_URL/admin/approve-officer/$OFFICER_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    check_response "$response" "Admin approves officer"
    
    # Test Officer Login
    print_step "Testing Officer Login..."
    response=$(curl -s -X POST "$BASE_URL/api/officer/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"testofficer@bmc.gov.in","password":"password123"}')
    
    if echo "$response" | grep -q '"success":true'; then
        OFFICER_TOKEN=$(extract_json_field "$response" "token")
        print_success "Officer login successful"
    else
        print_fail "Officer login failed: $response"
        return 1
    fi
    
    # Test Get Profile
    print_step "Testing Get Officer Profile..."
    response=$(curl -s "$BASE_URL/api/officer/me" \
        -H "Authorization: Bearer $OFFICER_TOKEN")
    check_response "$response" "Get officer profile"
    
    # Test BMC Dashboard - Pending Reviews
    print_step "Testing BMC Pending Reviews..."
    response=$(curl -s "$BASE_URL/api/bmc/pending-reviews" \
        -H "Authorization: Bearer $OFFICER_TOKEN")
    check_response "$response" "Get pending reviews"
    
    # Test BMC Dashboard - Dashboard Stats
    print_step "Testing BMC Dashboard Stats..."
    response=$(curl -s "$BASE_URL/api/bmc/officer/dashboard" \
        -H "Authorization: Bearer $OFFICER_TOKEN")
    check_response "$response" "Get dashboard stats"
    
    # Test BMC Dashboard - Notifications
    print_step "Testing BMC Notifications..."
    response=$(curl -s "$BASE_URL/api/bmc/officer/notifications" \
        -H "Authorization: Bearer $OFFICER_TOKEN")
    check_response "$response" "Get notifications"
}

###############################################################################
# Society Tests
###############################################################################

test_society() {
    print_header "4. Society Worker Tests"
    
    # Register Society
    print_step "Registering Society Worker..."
    response=$(curl -s -X POST "$BASE_URL/api/society/register" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Manager",
            "email": "testmanager@greenvalley.in",
            "password": "password123",
            "phone": "9876543210",
            "societyName": "Green Valley",
            "designation": "manager",
            "employeeId": "GV-001",
            "address": {
                "street": "123 Main Road",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            },
            "geoLockCoordinates": {
                "latitude": 19.0760,
                "longitude": 72.8777
            },
            "propertyTaxEstimate": 500000,
            "electricMeterSerialNumber": "EM-2024-12345"
        }')
    
    if echo "$response" | grep -q '"success":true'; then
        SOCIETY_ID=$(extract_json_field "$response" "id")
        SOCIETY_ACCOUNT_ID=$(extract_json_field "$response" "societyAccountId")
        print_success "Society registered: $SOCIETY_ID"
        print_success "Society Account ID: $SOCIETY_ACCOUNT_ID"
    else
        print_step "Society may already exist, extracting ID..."
        # Try to get society by logging in
        response=$(curl -s -X POST "$BASE_URL/api/society/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"testmanager@greenvalley.in","password":"password123"}')
        SOCIETY_TOKEN=$(extract_json_field "$response" "token")
        SOCIETY_ID=$(extract_json_field "$response" "id")
        SOCIETY_ACCOUNT_ID=$(extract_json_field "$response" "societyAccountId")
    fi
    
    # Admin Approves Society
    print_step "Admin approving society..."
    response=$(curl -s -X PUT "$BASE_URL/admin/approve-society/$SOCIETY_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    check_response "$response" "Admin approves society"
    
    # Test Society Login
    print_step "Testing Society Login..."
    response=$(curl -s -X POST "$BASE_URL/api/society/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"testmanager@greenvalley.in","password":"password123"}')
    
    if echo "$response" | grep -q '"success":true'; then
        SOCIETY_TOKEN=$(extract_json_field "$response" "token")
        SOCIETY_ACCOUNT_ID=$(extract_json_field "$response" "societyAccountId")
        print_success "Society login successful"
    else
        print_fail "Society login failed: $response"
        return 1
    fi
    
    # Test Get Profile
    print_step "Testing Get Society Profile..."
    response=$(curl -s "$BASE_URL/api/society/me" \
        -H "Authorization: Bearer $SOCIETY_TOKEN")
    check_response "$response" "Get society profile"
    
    # Test Get Society Info
    print_step "Testing Get Society Info..."
    response=$(curl -s "$BASE_URL/api/society/society" \
        -H "Authorization: Bearer $SOCIETY_TOKEN")
    check_response "$response" "Get society info"
    
    # Test Update Compost Weight
    print_step "Testing Update Compost Weight..."
    response=$(curl -s -X PATCH "$BASE_URL/api/society/society/compost-weight" \
        -H "Authorization: Bearer $SOCIETY_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"weight": 25.5}')
    check_response "$response" "Update compost weight"
}

###############################################################################
# Verification Tests
###############################################################################

test_verification() {
    print_header "5. Verification System Tests"
    
    if [ -z "$SOCIETY_TOKEN" ] || [ -z "$SOCIETY_ACCOUNT_ID" ]; then
        print_step "Skipping verification tests (no society token)"
        return
    fi
    
    # Submit Verification Report
    print_step "Submitting Verification Report..."
    response=$(curl -s -X POST "$BASE_URL/api/verification/report/upload" \
        -H "Authorization: Bearer $SOCIETY_TOKEN" \
        -F "societyAccountId=$SOCIETY_ACCOUNT_ID" \
        -F "meter_image=@$UPLOAD_DIR/verification/test-meter.jpg" \
        -F "composter_image=@$UPLOAD_DIR/verification/test-composter.jpg" \
        -F "gpsLatitude=19.0760" \
        -F "gpsLongitude=72.8777" \
        -F "notes=Automated test verification")
    
    if echo "$response" | grep -q '"success":true'; then
        REPORT_ID=$(extract_json_field "$response" "reportId")
        print_success "Verification report submitted: $REPORT_ID"
    else
        print_fail "Verification report submission failed: $response"
        return 1
    fi
    
    # Process Verification (AI Detection)
    print_step "Processing Verification (AI)..."
    response=$(curl -s -X POST "$BASE_URL/api/verification/detect" \
        -H "Authorization: Bearer $SOCIETY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"reportId\":\"$REPORT_ID\"}")
    
    if echo "$response" | grep -q '"success":true'; then
        VERIFICATION_STATUS=$(extract_json_field "$response" "verificationStatus")
        VERIFICATION_PROB=$(extract_json_field "$response" "verificationProbability")
        REBATE_AMOUNT=$(extract_json_field "$response" "rebateAmount")
        print_success "Verification processed: Status=$VERIFICATION_STATUS, Prob=$VERIFICATION_PROB, Rebate=$REBATE_AMOUNT"
    else
        print_fail "Verification processing failed: $response"
    fi
    
    # Test Get My Reports
    print_step "Testing Get My Reports..."
    response=$(curl -s "$BASE_URL/api/verification/reports/my" \
        -H "Authorization: Bearer $SOCIETY_TOKEN")
    check_response "$response" "Get my reports"
    
    # Test Get Report By ID
    print_step "Testing Get Report By ID..."
    response=$(curl -s "$BASE_URL/api/verification/reports/$REPORT_ID" \
        -H "Authorization: Bearer $SOCIETY_TOKEN")
    check_response "$response" "Get report by ID"
    
    # Save report ID for officer review
    print_step "Saving Report ID for officer review..."
    echo "$REPORT_ID" > "$SCRIPT_DIR/../sample-data/last_report_id.txt"
}

###############################################################################
# BMC Officer Review Tests
###############################################################################

test_bmc_review() {
    print_header "6. BMC Officer Review Tests"
    
    if [ -z "$OFFICER_TOKEN" ]; then
        print_step "Skipping review tests (no officer token)"
        return
    fi
    
    # Check for saved report ID or get from pending reviews
    if [ -f "$SCRIPT_DIR/../sample-data/last_report_id.txt" ]; then
        REPORT_ID=$(cat "$SCRIPT_DIR/../sample-data/last_report_id.txt")
        print_step "Using saved report ID: $REPORT_ID"
    else
        print_step "Getting pending reports..."
        local response=$(curl -s "$BASE_URL/api/bmc/pending-reviews" \
            -H "Authorization: Bearer $OFFICER_TOKEN")
        REPORT_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_step "Found report ID: $REPORT_ID"
    fi
    
    if [ -z "$REPORT_ID" ] || [ "$REPORT_ID" = "null" ]; then
        print_step "No pending reports for review"
        return
    fi
    
    # Test Approve Report
    print_step "Testing Officer Review - Approve..."
    response=$(curl -s -X PATCH "$BASE_URL/api/bmc/review/$REPORT_ID" \
        -H "Authorization: Bearer $OFFICER_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"action":"APPROVE","comments":"Verified and approved via automated test"}')
    check_response "$response" "Officer approves report"
    
    # Test Reject Report (optional, with different report)
    print_step "Skipping reject test (would need another report)"
    
    # Refresh Dashboard Stats
    print_step "Testing Dashboard Stats After Review..."
    response=$(curl -s "$BASE_URL/api/bmc/officer/dashboard" \
        -H "Authorization: Bearer $OFFICER_TOKEN")
    check_response "$response" "Get dashboard stats after review"
}

###############################################################################
# Resident Tests
###############################################################################

test_resident() {
    print_header "7. Resident Tests"
    
    # Register Resident
    print_step "Registering Resident..."
    response=$(curl -s -X POST "$BASE_URL/api/resident/register" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Resident",
            "email": "testresident@email.com",
            "password": "password123",
            "phone": "9876543210",
            "societyName": "Green Valley",
            "flatNumber": "A-101",
            "buildingName": "Tower A"
        }')
    
    if echo "$response" | grep -q '"success":true'; then
        RESIDENT_TOKEN=$(extract_json_field "$response" "token")
        print_success "Resident registered and logged in"
    else
        # Try login
        response=$(curl -s -X POST "$BASE_URL/api/resident/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"testresident@email.com","password":"password123"}')
        RESIDENT_TOKEN=$(extract_json_field "$response" "token")
        print_step "Resident logged in"
    fi
    
    # Test Get Profile
    print_step "Testing Get Resident Profile..."
    response=$(curl -s "$BASE_URL/api/resident/me" \
        -H "Authorization: Bearer $RESIDENT_TOKEN")
    check_response "$response" "Get resident profile"
    
    # Test Update Society
    print_step "Testing Update Society..."
    response=$(curl -s -X PUT "$BASE_URL/api/resident/society" \
        -H "Authorization: Bearer $RESIDENT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"societyName":"Green Valley","flatNumber":"B-205","buildingName":"Block B"}')
    check_response "$response" "Update resident society"
}

###############################################################################
# Customer Tests
###############################################################################

test_customer() {
    print_header "8. Customer Tests"
    
    # Register Customer
    print_step "Registering Customer..."
    response=$(curl -s -X POST "$BASE_URL/api/customer/register" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Customer",
            "email": "testcustomer@email.com",
            "password": "password123",
            "phone": "9876543210",
            "addresses": [{
                "street": "456 Park Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400002",
                "landmark": "Near Metro",
                "isDefault": true
            }]
        }')
    
    if echo "$response" | grep -q '"success":true'; then
        CUSTOMER_TOKEN=$(extract_json_field "$response" "token")
        print_success "Customer registered and logged in"
    else
        # Try login
        response=$(curl -s -X POST "$BASE_URL/api/customer/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"testcustomer@email.com","password":"password123"}')
        CUSTOMER_TOKEN=$(extract_json_field "$response" "token")
        print_step "Customer logged in"
    fi
    
    # Test Get Profile
    print_step "Testing Get Customer Profile..."
    response=$(curl -s "$BASE_URL/api/customer/me" \
        -H "Authorization: Bearer $CUSTOMER_TOKEN")
    check_response "$response" "Get customer profile"
    
    # Test Update Address
    print_step "Testing Update Address..."
    response=$(curl -s -X PUT "$BASE_URL/api/customer/address" \
        -H "Authorization: Bearer $CUSTOMER_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"street":"789 New Road","city":"Pune","state":"Maharashtra","pincode":"411001","landmark":"Near Mall","isDefault":true}')
    check_response "$response" "Update customer address"
}

###############################################################################
# Public API Tests
###############################################################################

test_public_apis() {
    print_header "9. Public API Tests (No Auth Required)"
    
    # Test Get All Societies
    print_step "Testing Get All Societies..."
    response=$(curl -s "$BASE_URL/api/resident/societies")
    check_response "$response" "Get all societies"
    
    # Test Get Society Details
    print_step "Testing Get Society Details..."
    response=$(curl -s "$BASE_URL/api/resident/societies/Green%20Valley")
    check_response "$response" "Get society details"
    
    # Test Get Society Reports
    print_step "Testing Get Society Reports..."
    response=$(curl -s "$BASE_URL/api/resident/societies/Green%20Valley/reports")
    check_response "$response" "Get society reports"
    
    # Test Get Society Tax Rebates
    print_step "Testing Get Society Tax Rebates..."
    response=$(curl -s "$BASE_URL/api/resident/societies/Green%20Valley/tax-rebates")
    check_response "$response" "Get society tax rebates"
    
    # Test Leaderboard
    print_step "Testing Leaderboard..."
    response=$(curl -s "$BASE_URL/api/resident/leaderboard")
    if echo "$response" | grep -q '"success":true'; then
        print_success "Get leaderboard"
        # Show top 3
        echo "$response" | grep -o '"societyName":"[^"]*"' | head -3 | while read line; do
            echo "  - $(echo $line | cut -d'"' -f4)"
        done
    else
        print_fail "Get leaderboard: $response"
    fi
    
    # Test Top 5
    print_step "Testing Top 5 Societies..."
    response=$(curl -s "$BASE_URL/api/resident/leaderboard/top/5")
    check_response "$response" "Get top 5 societies"
    
    # Test Society Rank
    print_step "Testing Society Rank..."
    response=$(curl -s "$BASE_URL/api/resident/leaderboard/society/Green%20Valley")
    check_response "$response" "Get society rank"
}

###############################################################################
# Summary
###############################################################################

print_summary() {
    print_header "Test Summary"
    
    echo -e "Total Tests: ${TESTS_TOTAL}"
    echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
    echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}All tests passed! ✓${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed. Please review the output above.${NC}"
        return 1
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "Genesis Backend - Automated Test Suite"
    echo "Starting test suite at $(date)"
    echo "Base URL: $BASE_URL"
    
    # Setup
    setup_directories
    create_test_files
    
    # Run tests
    test_health
    test_admin_auth
    test_bmc_officer
    test_society
    test_verification
    test_bmc_review
    test_resident
    test_customer
    test_public_apis
    
    # Summary
    print_summary
    
    # Cleanup
    cleanup
    
    # Exit with appropriate code
    if [ $TESTS_FAILED -gt 0 ]; then
        exit 1
    fi
}

# Run main function
main "$@"
